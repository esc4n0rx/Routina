// Tabela real de níveis conforme a imagem
const LEVEL_TABLE = [
  { nivel: 1, nome: "Iniciante", pontos_necessarios: 0 },
  { nivel: 2, nome: "Aprendiz", pontos_necessarios: 100 },
  { nivel: 3, nome: "Especialista", pontos_necessarios: 300 },
  { nivel: 4, nome: "Mestre", pontos_necessarios: 600 },
  { nivel: 5, nome: "Grão-Mestre", pontos_necessarios: 1000 },
  { nivel: 6, nome: "Lendário", pontos_necessarios: 1500 },
  { nivel: 7, nome: "Mítico", pontos_necessarios: 2100 },
  { nivel: 8, nome: "Divino", pontos_necessarios: 2800 },
  { nivel: 9, nome: "Transcendental", pontos_necessarios: 3600 },
  { nivel: 10, nome: "Iluminado", pontos_necessarios: 4500 },
];

export interface LevelInfo {
  nivel: number;
  nome: string;
  pontos_necessarios: number;
}

export interface LevelProgress {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  currentXP: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  percentage: number;
}

export const levelService = {
  // Obter informações de um nível específico
  getLevelInfo(level: number): LevelInfo | null {
    return LEVEL_TABLE.find(l => l.nivel === level) || null;
  },

  // Obter nível baseado no XP total
  getLevelByXP(totalXP: number): LevelInfo {
    // Encontrar o maior nível que o usuário pode alcançar com o XP atual
    let currentLevel = LEVEL_TABLE[0];
    
    for (const level of LEVEL_TABLE) {
      if (totalXP >= level.pontos_necessarios) {
        currentLevel = level;
      } else {
        break;
      }
    }
    
    return currentLevel;
  },

  // Calcular progresso no nível atual
  getLevelProgress(totalXP: number): LevelProgress {
    const currentLevel = this.getLevelByXP(totalXP);
    const nextLevel = LEVEL_TABLE.find(l => l.nivel === currentLevel.nivel + 1) || null;
    
    const xpInCurrentLevel = totalXP - currentLevel.pontos_necessarios;
    const xpNeededForNext = nextLevel 
      ? nextLevel.pontos_necessarios - currentLevel.pontos_necessarios 
      : 0;
    
    const percentage = nextLevel 
      ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100))
      : 100;

    return {
      currentLevel,
      nextLevel,
      currentXP: totalXP,
      xpInCurrentLevel,
      xpNeededForNext,
      percentage
    };
  },

  // Verificar se houve level up
  checkLevelUp(oldXP: number, newXP: number): { leveledUp: boolean; oldLevel: LevelInfo; newLevel: LevelInfo } {
    const oldLevel = this.getLevelByXP(oldXP);
    const newLevel = this.getLevelByXP(newXP);
    
    return {
      leveledUp: newLevel.nivel > oldLevel.nivel,
      oldLevel,
      newLevel
    };
  },

  // Obter todos os níveis
  getAllLevels(): LevelInfo[] {
    return [...LEVEL_TABLE];
  },

  // Verificar se é o nível máximo
  isMaxLevel(level: number): boolean {
    return level >= Math.max(...LEVEL_TABLE.map(l => l.nivel));
  }
};