import { Question, GameCategory, Difficulty, UserSettings } from '../types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getOperation = (): '+' | '-' => {
  return Math.random() < 0.5 ? '+' : '-';
};

export const calculateTimeLimit = (
  attempt: number,
  difficulty: Difficulty,
  category: GameCategory,
  userSettings?: UserSettings,
  adminConfig?: import('../types').PedagogyConfig | null
): number => {
  // 0. Global Timer Disable
  if (adminConfig) {
    const isChallenge = category === 'challenge';
    const subConfig = isChallenge ? adminConfig.desafios : adminConfig.practica_libre;
    if (subConfig.usa_cronometro === false) {
      return 999; // Effectively disable timer
    }
  }

  // 1. Priority: User Custom Settings (if defined for this difficulty)
  if (userSettings?.customTimers && userSettings.customTimers[difficulty]) {
    const customTime = userSettings.customTimers[difficulty];
    if (customTime) return customTime;
  }

  // Determine effective difficulty for challenge mode
  let effectiveDifficulty = difficulty;
  if (category === 'challenge') {
    if (attempt < 10) effectiveDifficulty = 'easy';
    else if (attempt < 20) effectiveDifficulty = 'easy_medium';
    else if (attempt < 30) effectiveDifficulty = 'medium';
    else if (attempt < 40) effectiveDifficulty = 'medium_hard';
    else effectiveDifficulty = 'hard';
  }

  // 2. Admin Config Timers
  if (adminConfig) {
    const isChallenge = category === 'challenge';
    if (isChallenge) {
      let adminTime = adminConfig.desafios.tiempo_default_segundos_11;
      if (effectiveDifficulty === 'medium' || effectiveDifficulty === 'medium_hard') {
        adminTime = adminConfig.desafios.tiempo_default_segundos_12;
      } else if (effectiveDifficulty === 'hard') {
        adminTime = adminConfig.desafios.tiempo_default_segundos_13;
      }
      if (adminTime) return adminTime;
    } else {
      const adminTime = adminConfig.practica_libre.tiempo_default_segundos;
      if (adminTime) return adminTime;
    }
  }

  // 3. Default Time Logic as fallback
  switch (effectiveDifficulty) {
    case 'easy': return 10;
    case 'easy_medium': return 12;
    case 'medium': return 14;
    case 'medium_hard': return 16;
    case 'hard': return 18;
    case 'random_tables': return 12;
    default: return 14;
  }
};

export const generateQuestion = (attempt: number, category: GameCategory, difficulty: Difficulty = 'medium'): Question => {
  
  // --- DESAFÍO MIXTO (Progresión Dinámica) ---
  if (category === 'challenge') {
    let subCategory: GameCategory = 'addition';
    let subDifficulty: Difficulty = 'easy';

    if (attempt < 10) {
      // Nivel 1: Sumas (50%) o Restas (50%)
      subDifficulty = 'easy';
      subCategory = Math.random() < 0.5 ? 'addition' : 'subtraction';
    } else if (attempt < 20) {
      // Nivel 2: Sumas (33%), Restas (33%) o Multiplicaciones (33%)
      subDifficulty = 'easy_medium';
      const r = Math.random();
      if (r < 0.33) subCategory = 'addition';
      else if (r < 0.66) subCategory = 'subtraction';
      else subCategory = 'multiplication';
    } else if (attempt < 30) {
      // Nivel 3: Sumas, Restas, Multiplicaciones o Divisiones (25% cada una)
      subDifficulty = 'medium';
      const r = Math.random();
      if (r < 0.25) subCategory = 'addition';
      else if (r < 0.5) subCategory = 'subtraction';
      else if (r < 0.75) subCategory = 'multiplication';
      else subCategory = 'division';
    } else if (attempt < 40) {
      // Nivel 4: Introducir operaciones combinadas y divisiones/multiplicaciones Nivel 4
      subDifficulty = 'medium_hard';
      const r = Math.random();
      if (r < 0.25) subCategory = 'multiplication';
      else if (r < 0.5) subCategory = 'division';
      else if (r < 0.75) subCategory = 'mixed_add_sub';
      else subCategory = 'mixed_mult_add';
    } else {
      // Nivel 5: Mezcla completa Nivel 4+ con operaciones encadenadas complejas
      // Divisiones usan medium_hard (su máximo nivel), el resto usa hard (Nivel 5)
      const r = Math.random();
      if (r < 0.2) {
        subDifficulty = 'medium_hard'; // División solo tiene hasta Nivel 4
        subCategory = 'division';
      } else if (r < 0.4) {
        subDifficulty = 'hard';
        subCategory = 'multiplication';
      } else if (r < 0.6) {
        subDifficulty = 'medium_hard';
        subCategory = 'all_mixed';
      } else if (r < 0.8) {
        subDifficulty = 'medium_hard';
        subCategory = 'mixed_mult_add';
      } else {
        subDifficulty = 'hard';
        subCategory = Math.random() < 0.5 ? 'addition' : 'subtraction';
      }
    }

    // Recursivamente llamamos a la función con los parámetros calculados
    return generateQuestion(attempt, subCategory, subDifficulty);
  }

  // --- SUMAS (Adición) ---
  if (category === 'addition') {
    switch (difficulty) {
      case 'easy': {
        // Nivel 1: 1 dígito + 1 dígito
        const a = getRandomInt(1, 9);
        const b = getRandomInt(1, 9);
        return { text: `${a} + ${b}`, answer: a + b };
      }
      case 'easy_medium': {
        // Nivel 2: 2 dígitos (10-20) + 1 dígito (1-9)
        const a = getRandomInt(10, 20);
        const b = getRandomInt(1, 9);
        return { text: `${a} + ${b}`, answer: a + b };
      }
      case 'medium': {
        // Nivel 3: 2 dígitos + 2 dígitos (10-50)
        const a = getRandomInt(10, 50);
        const b = getRandomInt(10, 50);
        return { text: `${a} + ${b}`, answer: a + b };
      }
      case 'medium_hard': {
        // Nivel 4: 3 números de 1 dígito
        const a = getRandomInt(1, 9);
        const b = getRandomInt(1, 9);
        const c = getRandomInt(1, 9);
        return { text: `${a} + ${b} + ${c}`, answer: a + b + c };
      }
      case 'hard': {
        // Nivel 5: Suma de 3 números (A y B 10-50; C 1-9)
        const a = getRandomInt(10, 50);
        const b = getRandomInt(10, 50);
        const c = getRandomInt(1, 9);
        return { text: `${a} + ${b} + ${c}`, answer: a + b + c };
      }
      default: {
        const a = getRandomInt(1, 9);
        const b = getRandomInt(1, 9);
        return { text: `${a} + ${b}`, answer: a + b };
      }
    }
  }

  // --- RESTAS (Sustracción) ---
  if (category === 'subtraction') {
    switch (difficulty) {
      case 'easy': {
        // Nivel 1: Número 2-10 menos número menor
        const a = getRandomInt(2, 10);
        const b = getRandomInt(1, a - 1);
        return { text: `${a} - ${b}`, answer: a - b };
      }
      case 'easy_medium': {
        // Nivel 2: 10-20 menos 1 dígito (1-9)
        const a = getRandomInt(10, 20);
        const b = getRandomInt(1, 9);
        return { text: `${a} - ${b}`, answer: a - b };
      }
      case 'medium': {
        // Nivel 3: 20-50 menos 1 dígito (2-9)
        const a = getRandomInt(20, 50);
        const b = getRandomInt(2, 9);
        return { text: `${a} - ${b}`, answer: a - b };
      }
      case 'medium_hard': {
        // Nivel 4: 2 dígitos menos 2 dígitos simples (A 30-99, B 10-25)
        const a = getRandomInt(30, 99);
        const b = getRandomInt(10, 25);
        // Garantizar A > B, si no, se cambian
        if (b >= a) {
          return { text: `${b + 10} - ${a}`, answer: (b + 10) - a };
        }
        return { text: `${a} - ${b}`, answer: a - b };
      }
      case 'hard': {
        // Nivel 5: 2 dígitos menos 2 dígitos complejos (A 50-99, B 20 hasta A-10)
        const a = getRandomInt(50, 99);
        // B de 20 hasta A-10
        const b = getRandomInt(20, Math.max(20, a - 10));
        return { text: `${a} - ${b}`, answer: a - b };
      }
      default: {
        const a = getRandomInt(2, 10);
        const b = getRandomInt(1, a - 1);
        return { text: `${a} - ${b}`, answer: a - b };
      }
    }
  }

  // --- MULTIPLICACIONES ---
  if (category === 'multiplication') {
    switch (difficulty) {
      case 'easy': {
        // Nivel 1: Multiplicar por 1, 2 o 10
        const aOptions = [1, 2, 10];
        const a = aOptions[Math.floor(Math.random() * aOptions.length)];
        const b = getRandomInt(1, 10);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      case 'easy_medium': {
        // Nivel 2: Tablas 2-5 por 1-10
        const a = getRandomInt(2, 5);
        const b = getRandomInt(1, 10);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      case 'medium': {
        // Nivel 3: Tablas 2-9 por 2-10
        const a = getRandomInt(2, 9);
        const b = getRandomInt(2, 10);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      case 'medium_hard': {
        // Nivel 4: Tablas 6-12 por 3-10
        const a = getRandomInt(6, 12);
        const b = getRandomInt(3, 10);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      case 'hard': {
        // Nivel 5: Factor A específico (12-15, 20, 25... 100) por Factor B (3-9)
        const aOptions = [12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
        const a = aOptions[Math.floor(Math.random() * aOptions.length)];
        const b = getRandomInt(3, 9);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      case 'random_tables': {
        // Aleatorio total
        const a = getRandomInt(1, 12);
        const b = getRandomInt(1, 12);
        return { text: `${a} × ${b}`, answer: a * b };
      }
      default: {
        const a = getRandomInt(2, 5);
        const b = getRandomInt(1, 10);
        return { text: `${a} × ${b}`, answer: a * b };
      }
    }
  }

  // --- DIVISIONES ---
  if (category === 'division') {
    let divisor = 2, quotient = 2;
    switch (difficulty) {
      case 'easy':
        divisor = getRandomInt(2, 3);
        quotient = getRandomInt(2, 5);
        break;
      case 'easy_medium':
        divisor = getRandomInt(2, 5);
        quotient = getRandomInt(2, 10);
        break;
      case 'medium':
        divisor = getRandomInt(3, 9);
        quotient = getRandomInt(3, 9);
        break;
      case 'medium_hard':
      case 'hard':
        divisor = getRandomInt(4, 12);
        quotient = getRandomInt(4, 12);
        break;
      default:
        divisor = getRandomInt(2, 3);
        quotient = getRandomInt(2, 5);
        break;
    }
    const dividend = divisor * quotient;
    return { text: `${dividend} ÷ ${divisor}`, answer: quotient };
  }

  // --- OPERACIONES COMBINADAS (Para niveles altos de desafío) ---
  if (category === 'mixed_add_sub') {
    // A + B - C o A - B + C
    const a = getRandomInt(10, 50);
    const b = getRandomInt(10, 50);
    const c = getRandomInt(5, 30);
    const op = getOperation();
    
    if (op === '+') {
      return { text: `${a} + ${b} - ${c}`, answer: a + b - c };
    } else {
      let bMod = b;
      if (a <= bMod) bMod = a - getRandomInt(1, 5); // Evitar negativos a mitad
      return { text: `${a} - ${bMod} + ${c}`, answer: a - bMod + c };
    }
  }

  if (category === 'mixed_mult_add') {
    // A * B + C o A * B - C
    const a = getRandomInt(3, 12);
    const b = getRandomInt(2, 9);
    const op = getOperation();
    
    if (op === '+') {
      const c = getRandomInt(5, 50);
      return { text: `${a} × ${b} + ${c}`, answer: (a * b) + c };
    } else {
      const c = getRandomInt(1, (a * b) - 1);
      return { text: `${a} × ${b} - ${c}`, answer: (a * b) - c };
    }
  }

  if (category === 'all_mixed') {
    // A * B / C  o  A + B * C
    if (Math.random() < 0.5) {
      // División exacta: C * Resultado = Multiplicación de A * B
      const result = getRandomInt(3, 12);
      const c = getRandomInt(2, 9);
      const product = result * c;
      
      // Encontrar factores para A y B
      let a = 1, b = product;
      for (let i = Math.floor(Math.sqrt(product)); i >= 2; i--) {
        if (product % i === 0) {
          a = i;
          b = product / i;
          break;
        }
      }
      return { text: `${a} × ${b} ÷ ${c}`, answer: result };
    } else {
      const b = getRandomInt(2, 9);
      const c = getRandomInt(2, 9);
      const a = getRandomInt(10, 50);
      const op = getOperation();
      
      if (op === '+') {
        return { text: `${a} + ${b} × ${c}`, answer: a + (b * c) };
      } else {
        const bigA = (b * c) + getRandomInt(5, 30); // Asegurar positivo
        return { text: `${bigA} - ${b} × ${c}`, answer: bigA - (b * c) };
      }
    }
  }

  return { text: "1 + 1", answer: 2 };
};
