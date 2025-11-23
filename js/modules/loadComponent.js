/**
 * Módulo para carregar componentes HTML externos
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Carrega um componente HTML e insere no elemento especificado
     * @param {string} elementId - ID do elemento onde inserir o componente
     * @param {string} componentPath - Caminho para o arquivo HTML do componente
     * @param {boolean} useCache - Se deve usar cache (padrão: true)
     * @returns {Promise<boolean>} - Retorna true se carregou com sucesso
     */
    async loadComponent(elementId, componentPath, useCache = true) {
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                console.warn(`Elemento com ID '${elementId}' não encontrado`);
                return false;
            }

            // Verificar se já está sendo carregado
            if (this.loadingPromises.has(componentPath)) {
                await this.loadingPromises.get(componentPath);
                return true;
            }

            // Verificar cache
            if (useCache && this.cache.has(componentPath)) {
                element.innerHTML = this.cache.get(componentPath);
                return true;
            }

            // Criar promise de carregamento
            const loadingPromise = this.fetchComponent(componentPath);
            this.loadingPromises.set(componentPath, loadingPromise);

            const html = await loadingPromise;
            
            // Remover da lista de carregamento
            this.loadingPromises.delete(componentPath);

            if (html) {
                // Adicionar ao cache
                if (useCache) {
                    this.cache.set(componentPath, html);
                }

                // Inserir no DOM
                element.innerHTML = html;
                
                // Disparar evento personalizado
                this.dispatchLoadedEvent(elementId, componentPath);
                
                return true;
            }

            return false;

        } catch (error) {
            console.error(`Erro ao carregar componente '${componentPath}':`, error);
            this.loadingPromises.delete(componentPath);
            return false;
        }
    }

    /**
     * Busca o conteúdo do componente
     * @param {string} componentPath - Caminho do componente
     * @returns {Promise<string|null>} - HTML do componente ou null se erro
     */
    async fetchComponent(componentPath) {
        try {
            const response = await fetch(componentPath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            return html;

        } catch (error) {
            console.error(`Falha ao buscar '${componentPath}':`, error);
            return null;
        }
    }

    /**
     * Carrega múltiplos componentes em paralelo
     * @param {Array<{id: string, path: string, cache?: boolean}>} components - Lista de componentes
     * @returns {Promise<Array<boolean>>} - Array com resultados dos carregamentos
     */
    async loadMultipleComponents(components) {
        const promises = components.map(component => 
            this.loadComponent(component.id, component.path, component.cache)
        );

        return Promise.all(promises);
    }

    /**
     * Carrega componentes em sequência
     * @param {Array<{id: string, path: string, cache?: boolean}>} components - Lista de componentes
     * @returns {Promise<Array<boolean>>} - Array com resultados dos carregamentos
     */
    async loadComponentsSequentially(components) {
        const results = [];
        
        for (const component of components) {
            const result = await this.loadComponent(component.id, component.path, component.cache);
            results.push(result);
        }

        return results;
    }

    /**
     * Recarrega um componente (ignora cache)
     * @param {string} elementId - ID do elemento
     * @param {string} componentPath - Caminho do componente
     * @returns {Promise<boolean>} - Sucesso do carregamento
     */
    async reloadComponent(elementId, componentPath) {
        // Remove do cache
        this.cache.delete(componentPath);
        return this.loadComponent(elementId, componentPath, false);
    }

    /**
     * Dispara evento quando componente é carregado
     * @param {string} elementId - ID do elemento
     * @param {string} componentPath - Caminho do componente
     */
    dispatchLoadedEvent(elementId, componentPath) {
        const event = new CustomEvent('componentLoaded', {
            detail: {
                elementId,
                componentPath,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Limpa o cache de componentes
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Obtém estatísticas do loader
     * @returns {Object} - Estatísticas
     */
    getStats() {
        return {
            cachedComponents: this.cache.size,
            loadingComponents: this.loadingPromises.size,
            cacheKeys: Array.from(this.cache.keys())
        };
    }

    /**
     * Pré-carrega componentes (apenas no cache, sem inserir no DOM)
     * @param {Array<string>} componentPaths - Caminhos dos componentes
     * @returns {Promise<Array<boolean>>} - Resultados do pré-carregamento
     */
    async preloadComponents(componentPaths) {
        const promises = componentPaths.map(async (path) => {
            try {
                const html = await this.fetchComponent(path);
                if (html) {
                    this.cache.set(path, html);
                    return true;
                }
                return false;
            } catch (error) {
                console.error(`Erro ao pré-carregar '${path}':`, error);
                return false;
            }
        });

        return Promise.all(promises);
    }
}

// Criar instância global
const componentLoader = new ComponentLoader();

// Funções de conveniência
export const loadComponent = (elementId, componentPath, useCache = true) => {
    return componentLoader.loadComponent(elementId, componentPath, useCache);
};

export const loadMultipleComponents = (components) => {
    return componentLoader.loadMultipleComponents(components);
};

export const loadComponentsSequentially = (components) => {
    return componentLoader.loadComponentsSequentially(components);
};

export const reloadComponent = (elementId, componentPath) => {
    return componentLoader.reloadComponent(elementId, componentPath);
};

export const preloadComponents = (componentPaths) => {
    return componentLoader.preloadComponents(componentPaths);
};

export const clearComponentCache = () => {
    componentLoader.clearCache();
};

export const getLoaderStats = () => {
    return componentLoader.getStats();
};

// Exportar instância para uso avançado
export { componentLoader };

// Exportar como padrão
export default {
    loadComponent,
    loadMultipleComponents,
    loadComponentsSequentially,
    reloadComponent,
    preloadComponents,
    clearComponentCache,
    getLoaderStats,
    componentLoader
};