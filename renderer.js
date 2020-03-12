

document.querySelector('#btn').addEventListener('click', async () => {
    window.postMessage({
        type: 'select-dir'
    })
});
