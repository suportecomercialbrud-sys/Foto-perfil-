// Elementos do DOM
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const imagePreview = document.getElementById('imagePreview');
const previewText = document.getElementById('previewText');
const mainCanvas = document.getElementById('mainCanvas');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');
const logoSizeSlider = document.getElementById('logoSize');
const sizeValue = document.getElementById('sizeValue');
const logoOpacitySlider = document.getElementById('logoOpacity');
const opacityValue = document.getElementById('opacityValue');
const logoTextInput = document.getElementById('logoText');
const applyLogoBtn = document.getElementById('applyLogo');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const positionButtons = document.querySelectorAll('.pos-btn');
const colorOptions = document.querySelectorAll('.color-option');

// Variáveis de estado
let originalImage = null;
let currentImage = null;
let logoPosition = 'br'; // br, bl, tr, tl
let logoColor = '#2c3e50';
let logoText = 'MINHA EMPRESA';

// Contexto do canvas
const ctx = mainCanvas.getContext('2d');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar ano no rodapé
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Configurar valores iniciais dos sliders
    updateSliderValues();
    
    // Configurar evento para mudança de texto da logo
    logoTextInput.addEventListener('input', function() {
        logoText = this.value || 'MINHA EMPRESA';
        if (currentImage) {
            applyLogoToImage();
        }
    });
});

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);

// Drag & Drop
dropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#edf2f7';
    dropArea.style.borderColor = '#2980b9';
});

dropArea.addEventListener('dragleave', function() {
    dropArea.style.backgroundColor = '#f8fafc';
    dropArea.style.borderColor = '#3498db';
});

dropArea.addEventListener('drop', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#f8fafc';
    dropArea.style.borderColor = '#3498db';
    
    if (e.dataTransfer.files.length) {
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
});

// Sliders
logoSizeSlider.addEventListener('input', function() {
    updateSliderValues();
    if (currentImage) {
        applyLogoToImage();
    }
});

logoOpacitySlider.addEventListener('input', function() {
    updateSliderValues();
    if (currentImage) {
        applyLogoToImage();
    }
});

// Botões de posição
positionButtons.forEach(button => {
    button.addEventListener('click', function() {
        positionButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        logoPosition = this.dataset.pos;
        if (currentImage) {
            applyLogoToImage();
        }
    });
});

// Opções de cor
colorOptions.forEach(option => {
    option.addEventListener('click', function() {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        logoColor = this.dataset.color;
        if (currentImage) {
            applyLogoToImage();
        }
    });
});

// Botões principais
applyLogoBtn.addEventListener('click', function() {
    if (!currentImage) {
        alert('Por favor, selecione uma foto primeiro.');
        return;
    }
    applyLogoToImage();
});

downloadBtn.addEventListener('click', downloadImage);

resetBtn.addEventListener('click', resetAll);

// Funções
function updateSliderValues() {
    sizeValue.textContent = `${logoSizeSlider.value}%`;
    opacityValue.textContent = `${logoOpacitySlider.value}%`;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar tipo de arquivo
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione um arquivo de imagem (JPG, PNG ou GIF).');
        return;
    }
    
    // Verificar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            // Mostrar pré-visualização pequena
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            previewText.style.display = 'none';
            
            // Configurar canvas principal
            setupMainCanvas();
            currentImage = originalImage;
            
            // Habilitar botão de download
            downloadBtn.disabled = false;
            
            // Aplicar logo automaticamente
            applyLogoToImage();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupMainCanvas() {
    const maxWidth = 800;
    const maxHeight = 500;
    let width = originalImage.width;
    let height = originalImage.height;
    
    // Manter proporção
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }
    
    mainCanvas.width = width;
    mainCanvas.height = height;
    
    // Mostrar canvas e esconder placeholder
    mainCanvas.style.display = 'block';
    canvasPlaceholder.style.display = 'none';
}

function applyLogoToImage() {
    if (!currentImage) return;
    
    // Limpar canvas
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Desenhar imagem original
    ctx.drawImage(currentImage, 0, 0, mainCanvas.width, mainCanvas.height);
    
    // Criar e desenhar logo
    drawLogo();
}

function drawLogo() {
    const logoSize = parseInt(logoSizeSlider.value) / 100;
    const opacity = parseInt(logoOpacitySlider.value) / 100;
    
    // Tamanho da logo baseado na largura da imagem
    const logoWidth = mainCanvas.width * logoSize;
    const logoHeight = logoWidth * 0.4; // Proporção 2.5:1
    
    // Posição
    let x, y;
    const margin = 20;
    
    switch(logoPosition) {
        case 'br': // bottom-right
            x = mainCanvas.width - logoWidth - margin;
            y = mainCanvas.height - logoHeight - margin;
            break;
        case 'bl': // bottom-left
            x = margin;
            y = mainCanvas.height - logoHeight - margin;
            break;
        case 'tr': // top-right
            x = mainCanvas.width - logoWidth - margin;
            y = margin;
            break;
        case 'tl': // top-left
            x = margin;
            y = margin;
            break;
    }
    
    // Desenhar fundo da logo com transparência
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = logoColor;
    ctx.fillRect(x, y, logoWidth, logoHeight);
    ctx.restore();
    
    // Adicionar texto da logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${logoHeight * 0.3}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Texto principal
    ctx.fillText(logoText, x + logoWidth / 2, y + logoHeight / 2);
    
    // Texto secundário (ano)
    ctx.font = `${logoHeight * 0.15}px Arial, sans-serif`;
    ctx.fillText(`© ${new Date().getFullYear()}`, x + logoWidth / 2, y + logoHeight / 2 + logoHeight * 0.25);
    
    // Borda branca sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, logoWidth, logoHeight);
}

function downloadImage() {
    if (!currentImage) {
        alert('Não há imagem para baixar.');
        return;
    }
    
    // Criar link para download
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    const filename = `foto_com_logo_${timestamp}.png`;
    
    link.download = filename;
    link.href = mainCanvas.toDataURL('image/png');
    link.click();
    
    // Feedback visual
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-check"></i> Baixado!';
    downloadBtn.style.background = '#27ae60';
    
    setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
    }, 2000);
}

function resetAll() {
    // Limpar inputs
    fileInput.value = '';
    
    // Resetar pré-visualização
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    previewText.style.display = 'block';
    
    // Resetar canvas principal
    mainCanvas.style.display = 'none';
    canvasPlaceholder.style.display = 'flex';
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    // Resetar variáveis
    originalImage = null;
    currentImage = null;
    
    // Desabilitar botão de download
    downloadBtn.disabled = true;
    
    // Resetar sliders para valores padrão
    logoSizeSlider.value = 25;
    logoOpacitySlider.value = 80;
    updateSliderValues();
    
    // Resetar posição e cor
    positionButtons.forEach(btn => {
        if (btn.dataset.pos === 'br') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    logoPosition = 'br';
    
    colorOptions.forEach(opt => {
        if (opt.dataset.color === '#2c3e50') {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
    logoColor = '#2c3e50';
    
    // Resetar texto
    logoTextInput.value = 'MINHA EMPRESA';
    logoText = 'MINHA EMPRESA';
}
