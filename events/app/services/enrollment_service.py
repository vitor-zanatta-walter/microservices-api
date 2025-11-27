import requests
from typing import List, Dict, Optional
from app.config import ENROLLMENTS_SERVICE_URL

class EnrollmentService:
    @staticmethod
    def get_attended_enrollments(event_id: int, token: str) -> List[Dict]:
        """
        Busca inscrições de um evento que tiveram presença confirmada.
        Faz uma chamada ao microserviço de Enrollments.
        """
        url = f"{ENROLLMENTS_SERVICE_URL}/events/{event_id}"
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            enrollments = response.json()
            print(f"DEBUG - Enrollments response: {enrollments}")
            print(f"DEBUG - Type: {type(enrollments)}")
            
            # Verificar se é uma lista
            if not isinstance(enrollments, list):
                print(f"ERRO: Esperava lista, recebeu {type(enrollments)}")
                return []
            
            # Filtrar apenas os que tiveram presença confirmada (status="present")
            result = []
            for e in enrollments:
                if isinstance(e, dict) and e.get("status") == "present":
                    result.append(e)
                elif isinstance(e, str):
                    print(f"AVISO: Enrollment é string: {e}")
            
            return result
            
        except requests.RequestException as e:
            print(f"Erro ao comunicar com serviço de Enrollments: {e}")
            # Em caso de erro, retornamos lista vazia ou propagamos erro customizado?
            # Por enquanto, vamos logar e retornar vazio para não quebrar tudo, 
            # mas idealmente deveria lançar uma exceção para o controller tratar.
            raise RuntimeError(f"Falha ao buscar inscrições: {str(e)}")
