import posthtml from '@vituum/vite-plugin-posthtml'

export default {
    root: './src',
    plugins: [
        posthtml()
    ],
    build: {
        outDir: '../dist'
    }
}