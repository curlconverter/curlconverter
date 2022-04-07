httpService = new http();
httpService.setUrl("http://localhost:5984/test/_security");
httpService.setCharset("utf-8");
httpService.setMethod("PUT");
httpService.addParam(type="header", name="Content-Type", value="application/x-www-form-urlencoded");
httpService.addParam(type="header", name="Authorization", value="admin:123");
httpService.addParam(type="body", value="{""admins"":{""names"":[], ""roles"":[]}, ""readers"":{""names"":[""joe""],""roles"":[]}}");
result = httpService.send().getPrefix();
writeDump(result);
