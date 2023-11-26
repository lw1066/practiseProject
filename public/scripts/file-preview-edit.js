const filePickerElement = document.getElementById('image');
const imagePreviewElement = document.getElementById('item-preview');
imagePreviewElement.style.display = 'block';

function showPreview() {
   
    const files = filePickerElement.files;
    if (!files || filePickerElement.length === 0) {
        imagePreviewElement.style.display = 'none';
        return;
    }

    const pickedFile = files[0];

    imagePreviewElement.src = URL.createObjectURL(pickedFile);
    imagePreviewElement.style.display = 'block';
};


filePickerElement.addEventListener('change', showPreview);