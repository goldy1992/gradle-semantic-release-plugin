import { existsSync } from "fs";
import { join } from "path";
import { parseFile, write } from "promisified-properties";
import { IContext } from "./definition";
import { getVersion } from "./gradle";

export async function updateVersion(
  cwd: string,
  version: string,
  pluginConfig: any
): Promise<void> {
  let prop = new Map<string, string>();
  if (pluginConfig !== undefined) {
    const versionName = pluginConfig.versionName || 'version';
    const versionCode = pluginConfig.versionCode;
    const propertyFilePath = pluginConfig.filePath || 'gradle.properties'
    const path = join(cwd, propertyFilePath);

    if (existsSync(path)) {
      prop = await parseFile(path);
    }
    prop.set(versionName, version);


    let currentVersionCode: any = prop.get(versionCode);
    if (currentVersionCode !== undefined) {
      const newVersionCode = currentVersionCode + 1;
      prop.set(versionCode, newVersionCode);
    }

  return write(prop, path);
  }
}

export default async function prepare(pluginConfig: object, context: IContext) {
  const { cwd, env, nextRelease } = context;
  await updateVersion(cwd, nextRelease.version, pluginConfig);
  const version = await getVersion(cwd, env as NodeJS.ProcessEnv);
  if (version !== nextRelease.version) {
    throw new Error(
      `Failed to update version from ${version} to ${nextRelease.version}. ` +
      "Make sure that you define version not in build.gradle but in gradle.properties."
    );
  }
}
