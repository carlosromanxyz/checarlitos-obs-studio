/**
 * Logo Widget
 * Funciones helper para manejar el estado del logo
 */

const LOGO_STORAGE_KEY = 'obs-logo-config';

const LogoWidget = {
  // Configuración por defecto
  defaultConfig: {
    isVisible: true,
    showText: false
  },

  /**
   * Cargar configuración desde localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem(LOGO_STORAGE_KEY);
      if (saved) {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error('Error loading logo config:', err);
    }
    return { ...this.defaultConfig };
  },

  /**
   * Guardar configuración en localStorage
   */
  save(config) {
    try {
      localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error('Error saving logo config:', err);
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
   * Toggle mostrar texto
   */
  toggleText() {
    const current = this.load();
    current.showText = !current.showText;
    return this.save(current);
  },

  /**
   * Mostrar texto
   */
  showText() {
    return this.update({ showText: true });
  },

  /**
   * Ocultar texto
   */
  hideText() {
    return this.update({ showText: false });
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
  window.LogoWidget = LogoWidget;
}
