/**
 * TikTok Widget
 * Funciones helper para manejar la configuración de TikTok Live
 */

const TIKTOK_STORAGE_KEY = 'tiktokConfig';

const TikTokWidget = {
  // Configuración por defecto
  defaultConfig: {
    username: '',
    isConnected: false,
    autoConnect: false
  },

  /**
   * Cargar configuración desde localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem(TIKTOK_STORAGE_KEY);
      if (saved) {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error('Error loading TikTok config:', err);
    }
    return { ...this.defaultConfig };
  },

  /**
   * Guardar configuración en localStorage
   */
  save(config) {
    try {
      localStorage.setItem(TIKTOK_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error('Error saving TikTok config:', err);
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
   * Establecer username
   */
  setUsername(username) {
    return this.update({ username: username.trim() });
  },

  /**
   * Marcar como conectado
   */
  setConnected(isConnected) {
    return this.update({ isConnected });
  },

  /**
   * Toggle auto-connect
   */
  toggleAutoConnect() {
    const current = this.load();
    current.autoConnect = !current.autoConnect;
    return this.save(current);
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
  window.TikTokWidget = TikTokWidget;
}
