document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variáveis globais
    const form = document.getElementById('avaliacaoForm');
    const mensagem = document.getElementById('mensagem');
    const sliders = document.querySelectorAll('.slider');
    const criterios = document.querySelectorAll('.criterio');
    const previewBtn = document.getElementById('previewBtn');
    const submitBtn = document.getElementById('submitBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const previewContent = document.getElementById('previewContent');
    const progressBar = document.getElementById('formProgress');
    const progressPercentage = document.getElementById('progressPercentage');
    
    // Inicializar tooltips
    initTooltips();
    
    // Inicializar sliders
    initSliders();
    
    // Inicializar validação de campos
    initValidation();
    
    // Inicializar contadores de caracteres
    initCharCounters();
    
    // Event listeners
    form.addEventListener('submit', handleSubmit);
    previewBtn.addEventListener('click', showPreview);
    closePreviewBtn.addEventListener('click', closePreview);
    closeModalBtn.addEventListener('click', closePreview);
    confirmSubmitBtn.addEventListener('click', confirmSubmit);
    
    // Funções de inicialização
    function initTooltips() {
        // Já implementado via CSS com data-tooltip
    }
    
    function initSliders() {
        sliders.forEach(slider => {
            const criterioId = slider.id;
            const valorSpan = document.getElementById('valor' + criterioId.charAt(0).toUpperCase() + criterioId.slice(1));
            
            // Atualizar o valor inicial
            valorSpan.textContent = slider.value;
            
            // Atualizar o valor quando o slider é movido
            slider.addEventListener('input', function() {
                valorSpan.textContent = this.value;
                
                // Animação do valor
                const badge = valorSpan.closest('.valor-badge');
                badge.classList.add('pulse');
                setTimeout(() => {
                    badge.classList.remove('pulse');
                }, 500);
            });
        });
    }
    
    function initValidation() {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            // Adicionar indicador de validação
            const container = input.closest('.input-container') || input.closest('.textarea-container');
            if (container) {
                const indicator = container.querySelector('.validation-indicator');
                
                input.addEventListener('blur', function() {
                    validateField(input, indicator);
                });
                
                input.addEventListener('input', function() {
                    if (input.classList.contains('error')) {
                        validateField(input, indicator);
                    }
                });
            }
        });
    }
    
    function validateField(field, indicator) {
        if (field.checkValidity() && field.value.trim() !== '') {
            field.classList.remove('error');
            field.classList.add('valid');
            if (indicator) {
                indicator.classList.remove('invalid');
                indicator.classList.add('valid');
            }
            return true;
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
            if (indicator) {
                indicator.classList.remove('valid');
                indicator.classList.add('invalid');
            }
            return false;
        }
    }
    
    function initCharCounters() {
        const textareas = document.querySelectorAll('textarea');
        
        textareas.forEach((textarea, index) => {
            const counter = document.getElementById(`charCount${index + 1}`);
            if (counter) {
                textarea.addEventListener('input', function() {
                    counter.textContent = this.value.length;
                    
                    // Mudar cor se estiver próximo do limite
                    if (this.value.length > 450) {
                        counter.style.color = '#dc3545';
                    } else {
                        counter.style.color = '';
                    }
                });
            }
        });
    }
    
    // Função de progresso removida conforme solicitado
    
    function showPreview() {
        // Verificar se todos os campos obrigatórios estão preenchidos
        const requiredFields = form.querySelectorAll('[required]');
        let allFilled = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field, field.closest('.input-container')?.querySelector('.validation-indicator'))) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            mensagem.textContent = 'Por favor, preencha todos os campos obrigatórios antes de visualizar.';
            mensagem.className = 'mensagem erro';
            mensagem.style.display = 'block';
            
            // Rolar até o primeiro campo com erro
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return;
        }
        
        // Gerar conteúdo de visualização
        generatePreviewContent();
        
        // Mostrar modal
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function generatePreviewContent() {
        const formData = new FormData(form);
        let previewHTML = '';
        
        // Informações do avaliador
        previewHTML += `
            <div class="preview-section">
                <h3>Informações do Avaliador</h3>
                <div class="preview-item">
                    <strong>Nome:</strong> ${formData.get('nomeAvaliador')}
                </div>
                <div class="preview-item">
                    <strong>Currículo Lattes:</strong> ${formData.get('curriculoLattes')}
                </div>
                <div class="preview-item">
                    <strong>Protocolo do Projeto:</strong> ${formData.get('protocoloProjeto')}
                </div>
                <div class="preview-item">
                    <strong>Título do Projeto:</strong> ${formData.get('tituloProjeto')}
                </div>
            </div>
        `;
        
        // Critérios de avaliação
        previewHTML += '<div class="preview-section"><h3>Critérios de Avaliação</h3>';
        
        criterios.forEach((criterio, index) => {
            const title = criterio.querySelector('h3').textContent;
            const peso = criterio.dataset.peso;
            const valor = sliders[index].value;
            const justificativa = formData.get(`justificativa${index + 1}`);
            
            previewHTML += `
                <div class="preview-criterio">
                    <h4>${title} <span class="preview-peso">(Peso ${peso})</span></h4>
                    <div class="preview-valor">Pontuação: <strong>${valor}/100</strong></div>
                    <div class="preview-justificativa">
                        <strong>Justificativa:</strong>
                        <p>${justificativa}</p>
                    </div>
                </div>
            `;
        });
        
        previewHTML += '</div>';
        
        // Adicionar estilos inline para o preview
        previewHTML = `
            <style>
                .preview-section { margin-bottom: 30px; }
                .preview-section h3 { color: #3AADDE; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 15px; }
                .preview-item { margin-bottom: 10px; }
                .preview-criterio { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #e9ecef; }
                .preview-criterio:last-child { border-bottom: none; }
                .preview-criterio h4 { margin-bottom: 10px; }
                .preview-peso { font-size: 14px; color: #3AADDE; }
                .preview-valor { margin-bottom: 10px; }
                .preview-justificativa p { background-color: #f8f9fa; padding: 10px; border-radius: 4px; }
            </style>
            ${previewHTML}
        `;
        
        previewContent.innerHTML = previewHTML;
    }
    
    function closePreview() {
        previewModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function handleSubmit(e) {
        e.preventDefault();
        
        // Verificar se todos os campos obrigatórios estão preenchidos
        const requiredFields = form.querySelectorAll('[required]');
        let allFilled = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field, field.closest('.input-container')?.querySelector('.validation-indicator'))) {
                allFilled = false;
            }
        });
        
        if (!allFilled) {
            mensagem.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            mensagem.className = 'mensagem erro';
            mensagem.style.display = 'block';
            
            // Rolar até o primeiro campo com erro
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return;
        }
        
        // Mostrar preview antes de enviar
        showPreview();
    }
    
    function confirmSubmit() {
        // Fechar modal
        closePreview();
        
        // Mostrar mensagem de carregamento
        mensagem.textContent = 'Enviando avaliação...';
        mensagem.className = 'mensagem carregando';
        mensagem.style.display = 'block';
        
        // Coletar dados do formulário
        const formData = new FormData(form);
        const dadosFormulario = {};
        
        formData.forEach((valor, chave) => {
            dadosFormulario[chave] = valor;
        });
        
        // Adicionar valores dos sliders
        sliders.forEach(slider => {
            dadosFormulario[slider.id + '_valor'] = slider.value;
        });
        
        // Enviar dados para o endpoint
        fetch('https://api.sheetmonkey.io/form/jJotmHpLKDGoULBwkVKsvo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosFormulario)
        })
        .then(response => {
            if (response.ok) {
                return response;
            }
            throw new Error('Erro na resposta da rede');
        })
        .then(() => {
            mensagem.textContent = 'Avaliação enviada com sucesso!';
            mensagem.className = 'mensagem sucesso';
            
            // Adicionar detalhes do envio
            const timestamp = new Date().toLocaleString('pt-BR');
            const protocolo = generateProtocol();
            
            mensagem.innerHTML = `
                <strong>Avaliação enviada com sucesso!</strong>
                <div class="mensagem-detalhes">
                    <p>Data e hora: ${timestamp}</p>
                    <p>Protocolo: ${protocolo}</p>
                </div>
            `;
            
            // Rolar para a mensagem
            mensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Desabilitar botão de envio
            submitBtn.disabled = true;
            submitBtn.textContent = 'Avaliação Enviada';
        })
        .catch(error => {
            mensagem.textContent = 'Erro ao enviar avaliação. Por favor, tente novamente.';
            mensagem.className = 'mensagem erro';
            console.error('Erro:', error);
            
            // Rolar para a mensagem
            mensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    // Função para gerar um protocolo único
    function generateProtocol() {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ICETI-${randomStr}-${timestamp.substring(timestamp.length - 4)}`;
    }
    
    // Adicionar estilos CSS para campos com erro
    const style = document.createElement('style');
    style.textContent = `
        input.error, textarea.error, select.error {
            border: 2px solid #dc3545 !important;
            background-color: #fff8f8;
        }
        
        input.valid, textarea.valid, select.valid {
            border: 1px solid #39B54A;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .pulse {
            animation: pulse 0.5s ease;
        }
        
        .mensagem-detalhes {
            margin-top: 10px;
            font-size: 14px;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
});
