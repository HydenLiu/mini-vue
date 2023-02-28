import typescript from '@rollup/plugin-typescript'
import { readFile } from "fs/promises";

const pkg = JSON.parse(await readFile("./package.json"));

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main,
    },
    {
      format: 'es',
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
}
