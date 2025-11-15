/**
 * Quotes Widget
 * Funciones helper para manejar el estado de frases motivacionales
 */

const QUOTES_STORAGE_KEY = 'quotesConfig';

// Banco de frases motivacionales en español
const LOCAL_QUOTES_BANK = [
  {
    text: "La única forma de hacer un gran trabajo es amar lo que haces.",
    author: "Steve Jobs"
  },
  {
    text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    author: "Robert Collier"
  },
  {
    text: "No cuentes los días, haz que los días cuenten.",
    author: "Muhammad Ali"
  },
  {
    text: "La creatividad es la inteligencia divirtiéndose.",
    author: "Albert Einstein"
  },
  {
    text: "El futuro pertenece a quienes creen en la belleza de sus sueños.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "La motivación es lo que te pone en marcha, el hábito es lo que hace que sigas.",
    author: "Jim Ryun"
  },
  {
    text: "No esperes. Nunca habrá un momento perfecto.",
    author: "Napoleon Hill"
  },
  {
    text: "La única manera de predecir el futuro es crearlo.",
    author: "Peter Drucker"
  },
  {
    text: "Cree en ti mismo y todo será posible.",
    author: "Anónimo"
  },
  {
    text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.",
    author: "Albert Schweitzer"
  },
  {
    text: "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden.",
    author: "Jerry Rice"
  },
  {
    text: "La persistencia garantiza que los resultados sean inevitables.",
    author: "Paramahansa Yogananda"
  },
  {
    text: "No dejes para mañana lo que puedes hacer hoy.",
    author: "Benjamin Franklin"
  },
  {
    text: "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra.",
    author: "Jimmy Johnson"
  },
  {
    text: "Tu tiempo es limitado, no lo desperdicies viviendo la vida de otro.",
    author: "Steve Jobs"
  },
  {
    text: "El fracaso es la oportunidad de comenzar de nuevo de forma más inteligente.",
    author: "Henry Ford"
  },
  {
    text: "La disciplina es el puente entre metas y logros.",
    author: "Jim Rohn"
  },
  {
    text: "No te rindas. El comienzo es siempre el más difícil.",
    author: "Anónimo"
  },
  {
    text: "La mejor manera de predecir tu futuro es crearlo.",
    author: "Abraham Lincoln"
  },
  {
    text: "Los límites solo existen en tu mente.",
    author: "Anónimo"
  },
  {
    text: "La acción es la clave fundamental de todo éxito.",
    author: "Pablo Picasso"
  },
  {
    text: "Cada experto fue una vez un principiante.",
    author: "Robin Sharma"
  },
  {
    text: "El momento perfecto es ahora.",
    author: "Anónimo"
  },
  {
    text: "Si puedes soñarlo, puedes lograrlo.",
    author: "Walt Disney"
  },
  {
    text: "La pasión es energía. Siente el poder que viene de enfocarte en lo que te emociona.",
    author: "Oprah Winfrey"
  },
  {
    text: "Lo que no te desafía, no te cambia.",
    author: "Fred DeVito"
  },
  {
    text: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.",
    author: "Winston Churchill"
  },
  {
    text: "La única limitación es la que tú te impones.",
    author: "Anónimo"
  },
  {
    text: "Trabaja duro en silencio, deja que el éxito haga el ruido.",
    author: "Frank Ocean"
  },
  {
    text: "No cuentes las horas, hazlas contar.",
    author: "Joe Louis"
  }
];

const QuotesWidget = {
  // Configuración por defecto
  defaultConfig: {
    isVisible: false,
    intervalSeconds: 20,
    useLocalBank: true
  },

  /**
   * Cargar configuración desde localStorage
   */
  load() {
    try {
      const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
      if (saved) {
        return { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.error('Error loading quotes config:', err);
    }
    return { ...this.defaultConfig };
  },

  /**
   * Guardar configuración en localStorage
   */
  save(config) {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (err) {
      console.error('Error saving quotes config:', err);
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
    return this.update({ intervalSeconds: parseInt(seconds) || 20 });
  },

  /**
   * Obtener frases (del banco local)
   */
  getQuotes() {
    return LOCAL_QUOTES_BANK;
  },

  /**
   * Obtener frase aleatoria
   */
  getRandomQuote() {
    const quotes = this.getQuotes();
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
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
  window.QuotesWidget = QuotesWidget;
}
