export interface Relatorio {
  _id?: string;

  aulaId: string;
  tutorId: string;

  observacoes?: string;

  arquivoUrl?: string;     // "/uploads/relatorios/arquivo.pdf"
  arquivoNome?: string;    // "relatorio.pdf"
  arquivoMime?: string;   

  createdAt: Date;
}
