/**
 * YouTube Carousel Widget
 * Funciones helper para manejar el estado del carrusel de YouTube
 */

const STORAGE_KEY = 'youtubeCarouselConfig';

const YoutubeCarouselWidget = {
  // Configuración por defecto
  defaultConfig: {
    isVisible: false,
    intervalSeconds: 30,
    videos: [],
    currentIndex: 0
  },

  /**
   * Cargar configuración desde localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error('Error loading youtube carousel config:', err);
    }
    return { ...this.defaultConfig };
  },

  /**
   * Guardar configuración en localStorage
   */
  save(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error('Error saving youtube carousel config:', err);
      return false;
    }
  },

  /**
   * Actualizar configuración parcialmente
   */
  update(updates) {
    const current = this.load();
    const updated = { ...current, ...updates };
    return this.save(updated);
  },

  /**
   * Toggle visibilidad
   */
  toggleVisibility() {
    const current = this.load();
    current.isVisible = !current.isVisible;
    return this.save(current);
  },

  /**
   * Mostrar overlay
   */
  show() {
    return this.update({ isVisible: true });
  },

  /**
   * Ocultar overlay
   */
  hide() {
    return this.update({ isVisible: false });
  },

  /**
   * Actualizar intervalo de rotación (segundos)
   */
  setInterval(seconds) {
    return this.update({ intervalSeconds: parseInt(seconds) || 30 });
  },

  /**
   * Validar ID de video de YouTube (11 caracteres alfanuméricos)
   */
  isValidVideoId(videoId) {
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  },

  /**
   * Agregar video a la lista
   */
  addVideo(videoId, location = '') {
    const current = this.load();

    // Validar ID
    if (!this.isValidVideoId(videoId)) {
      return false;
    }

    // Agregar video
    current.videos.push({
      videoId: videoId.trim(),
      location: location.trim().toUpperCase(),
      isEnabled: true
    });

    return this.save(current);
  },

  /**
   * Remover video de la lista
   */
  removeVideo(index) {
    const current = this.load();
    if (index >= 0 && index < current.videos.length) {
      current.videos.splice(index, 1);
      // Ajustar currentIndex si es necesario
      if (current.currentIndex >= current.videos.length) {
        current.currentIndex = Math.max(0, current.videos.length - 1);
      }
      return this.save(current);
    }
    return false;
  },

  /**
   * Toggle habilitar/deshabilitar video
   */
  toggleVideo(index, isEnabled) {
    const current = this.load();
    if (index >= 0 && index < current.videos.length) {
      current.videos[index].isEnabled = isEnabled;
      return this.save(current);
    }
    return false;
  },

  /**
   * Actualizar ubicación de un video
   */
  updateVideoLocation(index, location) {
    const current = this.load();
    if (index >= 0 && index < current.videos.length) {
      current.videos[index].location = location.trim().toUpperCase();
      return this.save(current);
    }
    return false;
  },

  /**
   * Ir al siguiente video (solo habilitados)
   */
  nextVideo() {
    const current = this.load();
    const enabledVideos = current.videos.filter(v => v.isEnabled !== false);

    if (enabledVideos.length === 0) return false;

    // Buscar el siguiente video habilitado
    let nextIndex = (current.currentIndex + 1) % current.videos.length;
    let attempts = 0;

    while (current.videos[nextIndex].isEnabled === false && attempts < current.videos.length) {
      nextIndex = (nextIndex + 1) % current.videos.length;
      attempts++;
    }

    if (current.videos[nextIndex].isEnabled !== false) {
      current.currentIndex = nextIndex;
      return this.save(current);
    }

    return false;
  },

  /**
   * Ir al video anterior (solo habilitados)
   */
  previousVideo() {
    const current = this.load();
    const enabledVideos = current.videos.filter(v => v.isEnabled !== false);

    if (enabledVideos.length === 0) return false;

    // Buscar el video anterior habilitado
    let prevIndex = (current.currentIndex - 1 + current.videos.length) % current.videos.length;
    let attempts = 0;

    while (current.videos[prevIndex].isEnabled === false && attempts < current.videos.length) {
      prevIndex = (prevIndex - 1 + current.videos.length) % current.videos.length;
      attempts++;
    }

    if (current.videos[prevIndex].isEnabled !== false) {
      current.currentIndex = prevIndex;
      return this.save(current);
    }

    return false;
  },

  /**
   * Ir a un video específico
   */
  goToVideo(index) {
    const current = this.load();
    if (index >= 0 && index < current.videos.length) {
      current.currentIndex = index;
      return this.save(current);
    }
    return false;
  },

  /**
   * Resetear a configuración por defecto
   */
  reset() {
    return this.save({ ...this.defaultConfig });
  }
};

// Exportar para uso en el browser
if (typeof window !== 'undefined') {
  window.YoutubeCarouselWidget = YoutubeCarouselWidget;
}
