document.body.setAttribute('ondrop', 'dropHandler(event);');
document.body.setAttribute('ondragover', 'dragOverHandler(event);')

window.onload = () => {
    document
        .getElementById('upload-button')
        .addEventListener('change', event => {
            upload(event.target.files[0]);
            document
                .querySelector('label.custom-file-label')
                .innerText = event.target.files[0].name
        });

    document
        .querySelector('.download-input')
        .addEventListener('keypress', download)

    document
        .querySelector('.download-button')
        .addEventListener('click', download)

}

function dragOverHandler(ev) {
    // Prevent browser from opening file
    ev.preventDefault();
}

function updateProgress(percent) {
    const progressBar = document.querySelector('div.progress-bar');
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent)
    document.querySelector('div.progress-number').innerText = `${percent}%`
    if (percent >= 100) {
        document.querySelector('div.progress-number').innerText = '100%'
        document.querySelector('div.checkmark').classList.remove('display-none')
    }
}

function upload(file) {
    const formdata = new FormData();

    formdata.append('file', file);

    const request = new XMLHttpRequest();
    request.responseType = 'json';
    const div = document.querySelector('div#link-info')
    div.classList.add('text-light', 'mt-3');
    // Progess indicator
    request.upload.addEventListener('progress', function(event) {
        const file1Size = file.size;
        if (event.loaded <= file1Size) {
            const percent = Math.round(event.loaded / file1Size * 100);
            updateProgress(percent);
        } else {
            updateProgress(100)
        }
    });

    request.onload = function(event) {
        if (request.status == 200) {
            div.innerHTML = `<p>Download link:</p><a class="h2" href="/download/${request.response.rwords}">${request.response.rwords.split(".").join(" ")}</a><br>${request.response.qrSvgString}`;
        } else {
            alert(request.statusText);
        }
    };

    request.open('POST', '/upload');
    request.timeout = 45000;
    request.send(formdata)
}

function dropHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // If the browser supports DataTransferItemList interface,
        // use getAsFile method to access the file(s)
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                upload(file)
            } else {
                alert('Only files can be uploaded.')
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            upload(ev.dataTransfer.files[i].name)
        }
    }
}

function download(event) {
    if (event.keyCode == 13 || event.type === 'click') { // 'enter' pressed
        var keywords = document.querySelector('.download-input').value;
        fetch('/download/' + keywords)
            .then(response => location.href = response.url)
            .catch(console.error);
    }
}