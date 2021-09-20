#!/usr/bin/env python3
#
# This script assumes ../curl/ is a git repo containing curl's source code
# and extracts the list of arguments curl accepts and writes the result as
# two JS objects (one for --long-options and one for -s (short) options)
# to util.js.
#
# curl defines its arguments in src/tool_getparam.c:
# https://github.com/curl/curl/blob/master/src/tool_getparam.c#L73
#
# Each argument definition is composed of
# letter - a 1 or 2 character string which acts as both a unique identifier
# of this argument, as well as its short form if it's 1 character long.
# lname - the --long-name of this option
# desc - the type of the option, which specifies if the option consumes a
# second argument or not.
#   ARG_STRING, ARG_FILENAME - consume a second argument
#   ARG_BOOL, ARG_NONE - don't consume a second argument.
# Historically, TRUE and FALSE were used.
#
# Each boolean argument (ARG_BOOL) also gets a --no-OPTION-NAME
# counterpart. ARG_NONE arguments do not.
#
# Multiple options can have the same `letter` if an option was renamed but
# the old name needs to also be kept for backwards compatibility. To these
# options we add a "name" property with the newest name.

from pathlib import Path
import sys
import subprocess
from collections import Counter

# Git repo of curl's source code to extract the args from
# TODO: make this a command line arg?
CURL_REPO = Path(__file__).parent.parent / "curl"
INPUT_FILE = CURL_REPO / "src" / "tool_getparam.c"
OUTPUT_FILE = Path(__file__).parent / "util.js"

OPTS_START = "struct LongShort aliases[]= {"
OPTS_END = "};"

BOOL_TYPES = ["bool", "none"]
STR_TYPES = ["string", "filename"]
ALIAS_TYPES = BOOL_TYPES + STR_TYPES

JS_PARAMS_START = "BEGIN GENERATED CURL OPTIONS"
JS_PARAMS_END = "END GENERATED CURL OPTIONS"

# These are options with the same `letter`, which are options that were
# renamed, along with their new name.
DUPES = {
    "krb": "krb",
    "krb4": "krb",
    "ftp-ssl": "ssl",
    "ssl": "ssl",
    "ftp-ssl-reqd": "ssl-reqd",
    "ssl-reqd": "ssl-reqd",
    "proxy-service-name": "proxy-service-name",
    "socks5-gssapi-service": "proxy-service-name",
}

if not OUTPUT_FILE.is_file():
    sys.exit(
        f"{OUTPUT_FILE} doesn't exist. You should run this script from curlconverter/"
    )
if not CURL_REPO.is_dir():
    sys.exit(
        f"{CURL_REPO} needs to be a git repo with curl's source code. "
        "You can clone it with\n\n"
        "git clone https://github.com/curl/curl ../curl"
        # or modify the CURL_REPO variable above
    )


def git_branch(git_dir=CURL_REPO):
    branch = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        cwd=git_dir,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return branch.strip()


def parse_aliases(lines):
    aliases = {}
    for line in lines:
        if OPTS_START in line:
            break
    for line in lines:
        line = line.strip()
        if line.endswith(OPTS_END):
            break
        if not line.strip().startswith("{"):
            continue

        # main.c has comments on the same line
        letter, lname, desc = line.split("/*")[0].strip().strip("{},").split(",")

        letter = letter.strip().strip('"')
        lname = lname.strip().strip('"')
        type_ = desc.strip().removeprefix("ARG_").lower()
        # The only difference is that ARG_FILENAMEs raise a warning if you pass a value
        # that starts with '-'
        if type_ == "filename":
            type_ = "string"
        # TODO: for most options, if you specify them more than once, only the last
        # one is taken. For others, (such as --url) each value is appended to a list
        # and all are processed. This would require parsing the C code in the switch
        # statement that processes the options.

        if 1 > len(letter) > 2:
            raise ValueError(f"letter form of --{lname} must be 1 or 2 characters long")
        if type_ not in ALIAS_TYPES:
            raise ValueError(f"unknown desc for --{lname}: {desc!r}")

        alias = {"letter": letter, "lname": lname, "type": type_}
        if lname in aliases and aliases[lname] != alias:
            print(
                f"{lname!r} repeated with different values:\n"
                + f"{aliases[lname]}\n"
                + f"{alias}",
                file=sys.stderr,
            )
        aliases[lname] = alias

    return list(aliases.values())


def fill_out_aliases(aliases, add_no_options=True):
    # If both --option and --other-option have "oO" (for example) as their `letter`,
    # add a "name" property with the main option's `lname`
    letter_count = Counter(a["letter"] for a in aliases)

    # "ARB_BOOL"-type OPTIONs have a --no-OPTION counterpart
    no_aliases = []

    for idx, alias in enumerate(aliases):
        if alias["type"] == "false":
            alias["type"] = "string"
        if alias["type"] == "true":
            alias["type"] = "bool" if add_no_options else "none"

        if alias["type"] in BOOL_TYPES:
            without_no = alias["lname"].removeprefix("no-").removeprefix("disable-")
            if alias["lname"] != without_no:
                print(f"Assuming --{alias['lname']} is {without_no!r}", file=sys.stderr)
                alias["name"] = without_no

        if letter_count[alias["letter"]] > 1:
            # Raise KeyError if special case hasn't been added yet
            candidate = DUPES[alias["lname"]]
            if alias["lname"] != candidate:
                alias["name"] = candidate

        if alias["type"] == "bool":
            no_alias = {
                **alias,
                "name": alias.get("name", alias["lname"]),
                "lname": "no-" + alias["lname"],
                # --no-OPTION options cannot be shortened
                "expand": False,
            }
            no_aliases.append((idx, no_alias))
        elif alias["type"] == "none":
            # The none/bool distinction is irrelevant after the step above
            alias["type"] = "bool"

    for i, (insert_idx, no_alias) in enumerate(no_aliases):
        # +1 so that --no-OPTION appears after --OPTION
        aliases.insert(insert_idx + i + 1, no_alias)

    return aliases


def split(aliases):
    long_args = {}
    short_args = {}
    for alias in aliases:
        if alias["lname"] in long_args:
            raise ValueError(f"duplicate lname: {alias['lname']!r}")
        long_args[alias["lname"]] = {
            k: v for k, v in alias.items() if k not in ["letter", "lname"]
        }
        if len(alias["letter"]) == 1:
            alias_name = alias.get("name", alias["lname"])
            if alias["letter"] == "N":  # -N is short for --no-buffer
                alias_name = "no-" + alias_name
            if (
                alias["letter"] in short_args
                and short_args[alias["letter"]] != alias_name
            ):
                raise ValueError(
                    f"duplicate short arg {alias['letter']!r}: {short_args[alias['letter']]!r} {alias_name!r}"
                )
            short_args[alias["letter"]] = alias_name
    return long_args, short_args


def format_as_js(d, var_name, indent=0, indent_type='\t'):
    yield f"{indent_type * indent}var {var_name} = {{"
    for top_key, opt in d.items():

        def quote(key):
            return key if key.isalpha() else repr(key)

        def val_to_js(val):
            if isinstance(val, str):
                return repr(val)
            if isinstance(val, bool):
                return str(val).lower()
            raise TypeError(f"can't convert values of type {type(val)} to JS")

        if isinstance(opt, dict):
            vals = [f"{quote(k)}: {val_to_js(v)}" for k, v in opt.items()]
            yield f"{indent_type * (indent + 1)}{top_key!r}: {{{', '.join(vals)}}},"
        elif isinstance(opt, str):
            yield f"{indent_type * (indent + 1)}{top_key!r}: {val_to_js(opt)},"

    yield (indent_type * indent) + "};"


def parse_version(tag):
    if not tag.startswith("curl-") or tag.startswith("curl_"):
        return None
    version = tag.removeprefix("curl-").removeprefix("curl_")
    version, *extra = version.split("-", 1)
    extra = extra[0] if extra else ""
    major, minor, *patch = version.split("_", 2)
    if len(patch) > 1:
        raise ValueError(f"unknown patch version {patch} from tag {tag}")
    patch = patch[0] if patch else "0"
    if not patch.isdigit():
        if extra:
            raise ValueError(f"two extras? {tag}")
        extra = patch
        patch = "0"
    if extra:  # filter pre-releases
        return None
    return int(major), int(minor), int(patch)


def curl_tags(git_dir=CURL_REPO):
    tags = (
        subprocess.run(
            ["git", "tag"],
            cwd=git_dir,
            check=True,
            capture_output=True,
            text=True,
        )
        .stdout.strip()
        .splitlines()
    )
    for tag in tags:
        version = parse_version(tag)
        if version:
            yield tag, version


def file_at_commit(filename, commit_hash, git_dir=CURL_REPO):
    contents = subprocess.run(
        ["git", "cat-file", "-p", f"{commit_hash}:{filename}"],
        cwd=git_dir,
        capture_output=True,
        check=True,
    ).stdout
    try:
        contents = contents.decode("utf-8")
    except UnicodeDecodeError:
        contents = contents.decode("latin1")
    return iter(contents.splitlines())


if __name__ == "__main__":
    if git_branch(CURL_REPO) != "master":
        sys.exit("not on curl repo's git master")

    *tags, last_tag = sorted(curl_tags(CURL_REPO), key=lambda x: x[1])

    aliases = fill_out_aliases(
        parse_aliases(file_at_commit("src/tool_getparam.c", last_tag[0]))
    )
    long_args, short_args = split(aliases)

    moved_file = False
    add_no_options = False
    # for tag, version in
    #     old_aliases = fill_out_aliases(parse_aliases(f), add_no_options)

    js_params_lines = list(format_as_js(long_args, "opts", indent_type="  "))
    js_params_lines += [""]  # separate by a newline
    js_params_lines += list(format_as_js(short_args, "shortOpts", indent_type="  "))

    new_lines = []
    with open(OUTPUT_FILE) as f:
        for line in f:
            new_lines.append(line)
            if JS_PARAMS_START in line:
                break
        else:
            raise ValueError(f"{'// ' + JS_PARAMS_START!r} not in {OUTPUT_FILE}")

        new_lines += [l + "\n" for l in js_params_lines]
        for line in f:
            if JS_PARAMS_END in line:
                new_lines.append(line)
                break
        else:
            raise ValueError(f"{'// ' + JS_PARAMS_END!r} not in {OUTPUT_FILE}")
        for line in f:
            new_lines.append(line)

    with open(OUTPUT_FILE, "w", newline="\n") as f:
        f.write("".join(new_lines))
