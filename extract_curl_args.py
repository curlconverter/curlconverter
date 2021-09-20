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
# TODO: make this an optional command line arg
CURL_REPO = Path(__file__).parent.parent / "curl"

OLD_INPUT_FILE = CURL_REPO / "src" / "main.c"
NEW_INPUT_FILE = CURL_REPO / "src" / "tool_getparam.c"
FILE_MOVED_TAG = "curl-7_23_0"  # when the above change happened

# Originally there were only two arg "types": TRUE/FALSE which signified
# whether the option expected a value or was a boolean (respectively).
# Then in
# 5abfdc0140df0977b02506d16796f616158bfe88
# which was released as
NO_OPTIONS_TAG = "curl-7_19_0"
# all boolean (i.e. FALSE "type") options got an implicit --no-OPTION.
# Then TRUE/FALSE was changed to ARG_STRING/ARG_BOOL.
# Then it was realized that not all options should have a --no-OPTION
# counterpart, so a new ARG_NONE type was added for those in
# 913c3c8f5476bd7bc4d8d00509396bd4b525b8fc

OPTS_START = "struct LongShort aliases[]= {"
OPTS_END = "};"

BOOL_TYPES = ["bool", "none"]
STR_TYPES = ["string", "filename"]
ALIAS_TYPES = BOOL_TYPES + STR_TYPES
RAW_ALIAS_TYPES = ALIAS_TYPES + ['true', 'false']


OUTPUT_FILE = Path(__file__).parent / "util.js"

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
    # These argument names have been deleted,
    # they should appear as deleted options.
    "request": "request",
    "http-request": "request",
    "use-ascii": "use-ascii",
    "ftp-ascii": "use-ascii",
    "ftpport": "ftp-port",
     "ftp-port":  "ftp-port",
    "socks": "socks5",
    "socks5": "socks5",
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

def is_git_repo(git_dir=CURL_REPO):
    result = subprocess.run(
        ["git", "rev-parse", "--is-inside-work-tree"],
        cwd=git_dir,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0 and result.stdout.strip() == 'true'


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
        if type_ not in RAW_ALIAS_TYPES:
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
        if alias["type"] == "true":
            alias["type"] = "string"
        if alias["type"] == "false":
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


def format_as_js(d, var_name, indent='\t', indent_level=0):
    yield f"{indent * indent_level}const {var_name} = {{"
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
            yield f"{indent * (indent_level + 1)}{top_key!r}: {{{', '.join(vals)}}},"
        elif isinstance(opt, str):
            yield f"{indent * (indent_level + 1)}{top_key!r}: {val_to_js(opt)},"

    yield (indent * indent_level) + "};"


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
        if parse_version(tag):
            yield tag


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
    # TODO: check that repo is up to date
    if not is_git_repo(CURL_REPO):
        sys.exit(f"{CURL_REPO} is not a git repo")

    tags = sorted(curl_tags(CURL_REPO), key=parse_version)

    old_aliases = {}
    filename = "src/main.c"
    add_no_options = False
    for tag in tags:
        print(tag)
        if tag == FILE_MOVED_TAG:
            filename = "src/tool_getparam.c"
        if tag == NO_OPTIONS_TAG:
            add_no_options = True
        f = file_at_commit(filename, tag)
        for alias in fill_out_aliases(parse_aliases(f), add_no_options):
            alias_name = alias.get('name', alias['lname'])
            alias_uniqueness = (
                alias['lname'],
                DUPES.get(alias_name, alias_name),
                alias['letter'] if len(alias['letter']) == 1 else '',
                alias['type'],
                alias.get('expand', True)
            )
            old_aliases.setdefault(alias_uniqueness, []).append(tag)
    import pprint
    pprint.pprint(old_aliases)
    missing_aliases= {}
    for alias, lifespan in old_aliases.items():
        if lifespan[-1] != tags[-1]:
            print(lifespan[-1] , tags[-1])
            missing_aliases[alias] = lifespan[-1]
    pprint.pprint(missing_aliases)

    aliases = fill_out_aliases(
        parse_aliases(file_at_commit(filename, tags[-1])),
        add_no_options
    )
    long_args, short_args = split(aliases)


    current_aliases = {a['lname']: a for a in aliases}
    changed_aliases = []
    changed_short_args= {}
    deleted_aliases = {}
    for missing_alias, removed in missing_aliases.items():
        missing_alias = {
            "lname": missing_alias[0],
            "name": missing_alias[1],
            "letter": missing_alias[2],
            "type": missing_alias[3],
            "expand": missing_alias[4],
        }
        if missing_alias['lname'] in current_aliases:
            current_alias = current_aliases[missing_alias['lname']]
            current_alias = {
                "lname": current_alias['lname'],
                "name": current_alias.get('name', current_alias['lname']),
                "letter": current_alias['letter'] if len(current_alias['letter']) == 1 else '',
                "type": current_alias['type'],
                "expand": current_alias.get('expand', True),
            }
            except_letter = missing_alias.keys() - {'letter'}
            if all(missing_alias[p] == current_alias[p] for p in except_letter):
                changed_short_args[missing_alias['letter']] = [missing_alias['lname'], removed]
            else:
                print(removed)
                print(missing_alias, '->', )
                print(current_alias)
                print()
                missing_alias['deleted'] = removed
                deleted_aliases[missing_alias['lname']] = missing_alias
            # if all(missing_alias.keys(
        else:
            missing_alias['deleted'] = removed
            deleted_aliases[missing_alias['lname']] = missing_alias

    for deleted_alias in deleted_aliases.values():
        if not deleted_alias['letter']:
            continue
        if deleted_alias['letter'] not in short_args:
            if deleted_alias['letter'] in changed_short_args:
                raise ValueError(f"duplicate deleted short option: {deleted_alias} {changed_short_args[deleted_alias['letter']]}")
            changed_short_args[deleted_alias['letter']] = deleted_alias
            continue
        existing = short_args[deleted_alias['letter']]
        existing_arg = long_args[existing]
        existing_arg_name = existing_arg.get('name') #, existing_arg['lname'])
        if existing_arg_name == deleted_alias['name']:
            continue


    pprint.pprint(changed_short_args, sort_dicts=False)
    pprint.pprint(deleted_aliases, sort_dicts=False)


    # breakpoint()
    # exit()

    js_params_lines = list(format_as_js(long_args, "curlLongOpts", indent="  "))
    js_params_lines += [""]  # separate by a newline
    js_params_lines += list(format_as_js(short_args, "curlShortOpts", indent="  "))

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
