/**
 * YouTube Carousel Widget
 * Funciones helper para manejar el estado del carrusel de YouTube
 */

const STORAGE_KEY = 'youtubeCarouselConfig';

const YoutubeCarouselWidget = {
  // Configuración por defecto
  defaultConfig: {
    isVisible: false,
    location: 'YouTube',
    videos: [],
    currentIndex: 0,
    duration: 30,
    autoplay: true
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
   * Actualizar ubicación
   */
  setLocation(location) {
    return this.update({ location });
  },

  /**
   * Actualizar lista de videos
   */
  setVideos(videos) {
    return this.update({ videos, currentIndex: 0 });
  },

  /**
   * Agregar video a la lista
   */
  addVideo(videoUrl) {
    const current = this.load();
    current.videos.push(videoUrl);
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
   * Actualizar duración por video
   */
  setDuration(duration) {
    return this.update({ duration: parseInt(duration) || 30 });
  },

  /**
   * Toggle autoplay
   */
  toggleAutoplay() {
    const current = this.load();
    current.autoplay = !current.autoplay;
    return this.save(current);
  },

  /**
   * Ir al siguiente video
   */
  nextVideo() {
    const current = this.load();
    if (current.videos.length > 0) {
      current.currentIndex = (current.currentIndex + 1) % current.videos.length;
      return this.save(current);
    }
    return false;
  },

  /**
   * Ir al video anterior
   */
  previousVideo() {
    const current = this.load();
    if (current.videos.length > 0) {
      current.currentIndex = (current.currentIndex - 1 + current.videos.length) % current.videos.length;
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
  },

  /**
   * Validar URL de YouTube
   */
  isValidYoutubeUrl(url) {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([^&\n?#]+)/
    ];
    return patterns.some(pattern => pattern.test(url));
  },

  /**
   * Extraer ID de video de YouTube
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
};

// Exportar para uso en el browser
if (typeof window !== 'undefined') {
  window.YoutubeCarouselWidget = YoutubeCarouselWidget;
}
