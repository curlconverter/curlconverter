httpService = new http();
httpService.setUrl("http://localhost:28139/post-to-me.php");
httpService.setMethod("POST");
httpService.addParam(type="formfield", name="username", value="davidwalsh");
httpService.addParam(type="formfield", name="password", value="something");

result = httpService.send().getPrefix();
writeDump(result);
