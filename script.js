document.addEventListener('DOMContentLoaded', function() {
    const fetchQualitiesButton = document.getElementById('fetchQualities');
    const videoUrlInput = document.getElementById('videoUrl');
    const qualitySelectionDiv = document.getElementById('qualitySelection');
    const qualityOptionsDiv = document.getElementById('qualityOptions');
    const progressDiv = document.getElementById('progress');
    const downloadMoreDiv = document.getElementById('downloadMore');
    const downloadMoreButton = document.getElementById('downloadMoreButton');
    const initialInputDiv = document.getElementById('initialInput');

    fetchQualitiesButton.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();
        if (url) {
            try {
                const response = await fetch('/get_video_info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });
                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                    return;
                }
                const qualities = data.qualities;
                qualityOptionsDiv.innerHTML = '';
                qualities.forEach(quality => {
                    const qualityOption = document.createElement('div');
                    qualityOption.classList.add('quality-option');
                    qualityOption.innerHTML = `
                        <span>${quality}</span>
                        <button class="downloadButton" data-quality="${quality}">Download</button>
                    `;
                    qualityOptionsDiv.appendChild(qualityOption);
                });
                qualitySelectionDiv.style.display = 'block';
            } catch (error) {
                alert('Failed to fetch video information');
            }
        }
    });

    qualityOptionsDiv.addEventListener('click', async function(event) {
        if (event.target.classList.contains('downloadButton')) {
            const quality = event.target.getAttribute('data-quality');
            const url = videoUrlInput.value.trim();
            if (!url || !quality) {
                alert('Please enter a valid URL and select a quality');
                return;
            }

            progressDiv.style.display = 'block';
            qualitySelectionDiv.style.display = 'none';
            
            try {
                const response = await fetch('/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url, quality: quality })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    alert(errorData.error);
                    return;
                }
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${url.split('v=')[1]}_${quality}.mp4`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                progressDiv.style.display = 'none';
                downloadMoreDiv.style.display = 'block';
            } catch (error) {
                alert('Failed to download the video');
                progressDiv.style.display = 'none';
                qualitySelectionDiv.style.display = 'block';
            }
        }
    });

    downloadMoreButton.addEventListener('click', function() {
        videoUrlInput.value = '';
        qualitySelectionDiv.style.display = 'none';
        downloadMoreDiv.style.display = 'none';
        initialInputDiv.style.display = 'block';
    });
});
