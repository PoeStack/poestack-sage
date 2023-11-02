buildscript {
  val isWindows = System.getProperty("os.name").toLowerCase().contains("win");
  if (isWindows) {
    extra.set("npm", "npm.cmd");
    extra.set("npx", "npx.cmd");
  } else {
    extra.set("npm", "npm");
    extra.set("npx", "npx");
  }
}