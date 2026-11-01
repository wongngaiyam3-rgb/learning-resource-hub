import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({root:here+'frontend',base:'./',plugins:[react()],publicDir:false,css:{postcss:{plugins:[tailwindcss()]}},build:{outDir:here+'prepared-release',emptyOutDir:true,minify:true,sourcemap:false,rollupOptions:{input:{index:here+'frontend/index.html',teacher:here+'frontend/teacher.html'}}}});
