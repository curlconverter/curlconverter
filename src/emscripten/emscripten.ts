let scriptDirectory = "";
debugger;
const ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
if (ENVIRONMENT_IS_WORKER) {
  // Check worker, not web, since window could be polyfilled
  scriptDirectory = self.location.href;
} else if (typeof document != "undefined" && document.currentScript) {
  // web
  scriptDirectory = (document.currentScript as any).src;
}
// blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
// otherwise, slice off the final part of the url to find the script directory.
// if scriptDirectory does not contain a slash, lastIndexOf will return -1,
// and scriptDirectory will correctly be replaced with an empty string.
// If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
// they are removed because they could contain a slash.
if (scriptDirectory.startsWith("blob:")) {
  scriptDirectory = "";
} else {
  scriptDirectory = scriptDirectory.substr(
    0,
    scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1,
  );
}

export default scriptDirectory;
