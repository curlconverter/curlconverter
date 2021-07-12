// This script generates a list of all of cURL's options
// by parsing `curl --help`

const { execSync } = require('child_process')

const stdin = execSync('curl --help').toString()

// https://github.com/curl/curl/pull/7378
const actuallyNotBooleanOpts = ['tlspassword', 'stderr', 'request-target', 'quote']

const booleanOpts = []
// Use Map to maintain the same order as `curl --help` to reduce churn in diffs
// TODO: format Map as object instead of having to do it by hand
const aliases = new Map()
for (const line of stdin.split('\n')) {
  if (line.startsWith('Usage: ') || !line) {
    continue
  }
  const match = line.match(/^( -(?<short>.),)? +--(?<long>\S+) /)
  if (!match) {
    console.error('failed to match line:', line)
    continue
  }
  const short = match.groups.short
  let long = match.groups.long

  // All of cURL's short options have a long form
  if (short && !long) {
    console.error('short option doesn\'t have long option', line)
  }

  // If line looks something like
  // --user-agent <name>
  // or
  // --proxy [protocol://]host[:port]
  // it's not a boolean option.
  const isBooleanOpt = !(line.match(/^( -(?<short>.),)? +--(?<long>\S+) +[[<]/)) && !actuallyNotBooleanOpts.includes(long)
  // Should be checked by hand
  // console.error((isBooleanOpt + '').padEnd(5), line)

  if (long.startsWith('no-')) {
    if (!isBooleanOpt) {
      console.error('non-boolean option starts with negation prefix "no-"', line)
    }
    // Yargs' 'boolean-negation' (enabled by default) takes care of these.
    //
    // There's a -N short option which is short for --no-buffer, but because we remove the
    // "no-" here, -N is incorrectly aliased to --buffer instead.
    // This is okay because we don't do anything with --buffer's value, we just need yargs to
    // parse it as a boolean option.
    // https://github.com/yargs/yargs-parser/issues/406
    long = long.slice(3)
  }

  if (short && long) {
    aliases.set(short, long)
  }
  if (isBooleanOpt) {
    booleanOpts.push(long)
  }
}

console.dir({
  boolean: booleanOpts,
  alias: aliases,
  configuration: {}
}, { maxArrayLength: null })
