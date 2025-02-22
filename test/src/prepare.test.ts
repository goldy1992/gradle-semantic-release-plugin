import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { expect } from "chai";
import "mocha";
import { updateVersion } from "../../src/prepare";
import { parseFile, write } from "promisified-properties";

describe("Test for prepare step", () => {
  afterEach(async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const path = join(gradleProject, "gradle.properties");
    return write(new Map([["version", "0.1.2"]]), path);
  });
  it("updateVersion() will update version in gradle.properties", async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const properties = {
      "filePath": "gradle.properties",
      "versionName": "version"
    }
    await updateVersion(gradleProject, "2.3.4", properties);
    const path = join(gradleProject, "gradle.properties");
    return parseFile(path).then(updated => {
      expect(updated.get("version")).to.equal("2.3.4");
    });
  });
});

describe("Test for prepare step without gradle.properties", () => {
  beforeEach(async () => {
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    const path = join(gradleProject, "gradle.properties");
    if (existsSync(path)) {
      unlinkSync(path);
    }
  });
  it("updateVersion() will create gradle.properties with specified version", async () => {
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    const properties = {
      "filePath": "gradle.properties",
      "versionName": "version"
    }
    await updateVersion(gradleProject, "2.3.4", properties);
    const path = join(gradleProject, "gradle.properties");
    return parseFile(path).then(updated => {
      expect(updated.get("version")).to.equal("2.3.4");
    });
  });
});
