import { CCError } from "../util.js";
import { Word } from "../shell/Word.js";
import { SrcFormParam } from "../curl/opts.js";

// contentFile is the file to read the content from
// filename is the name of the file to send to the server
export type FormParam = {
  name: Word;
} & ({ content: Word } | { contentFile: Word; filename?: Word });

// TODO: https://curl.se/docs/manpage.html#-F
// -F is the most complicated option, we only handle
// name=value and name=@file and name=<file
export function parseForm(form: SrcFormParam[]): FormParam[] {
  const multipartUploads = [];
  for (const multipartArgument of form) {
    if (!multipartArgument.value.includes("=")) {
      throw new CCError(
        "invalid value for --form/-F: " +
          JSON.stringify(multipartArgument.value.toString())
      );
    }
    const [name, value] = multipartArgument.value.split("=", 2);

    const isString = multipartArgument.type === "string";

    if (!isString && value.charAt(0) === "@") {
      const contentFile = value.slice(1);
      const filename = contentFile;
      multipartUploads.push({ name, contentFile, filename });
    } else if (!isString && value.charAt(0) === "<") {
      const contentFile = value.slice(1);
      multipartUploads.push({ name, contentFile });
    } else {
      const content = value;
      multipartUploads.push({ name, content });
    }
  }
  return multipartUploads;
}
