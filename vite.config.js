import posthtml from '@vituum/vite-plugin-posthtml'

export default {
    base: './',
    root: './src',
    plugins: [
        posthtml()
    ],
    build: {
        outDir: '../dist'
    },
}