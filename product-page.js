document.addEventListener('DOMContentLoaded', () => {
    const buyButton = document.getElementById('buyButton');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementsByClassName('close')[0];

    buyButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
