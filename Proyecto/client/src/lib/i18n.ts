import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "databases": "Bases de Datos",
        "windows": "Windows",
        "linux": "Linux",
        "logs": "Logs",
        "home": "Inicio"
      },
      "dashboard": {
        "title": "Panel de Control de Infraestructura",
        "total_systems": "Sistemas Totales",
        "active_systems": "Sistemas Activos",
        "critical_alerts": "Alertas Críticas",
        "health_score": "Puntuación de Salud",
        "overview": "Resumen General",
        "status": "Estado"
      },
      "databases": {
        "title": "Bases de Datos",
        "active_connections": "Conexiones Activas",
        "blocked_users": "Usuarios Bloqueados",
        "tablespace_usage": "Uso de Tablespace",
        "log_size": "Tamaño de Log",
        "service_status": "Estado del Servicio"
      },
      "windows": {
        "title": "Sistemas Windows",
        "iis_services": "Servicios IIS",
        "performance": "Rendimiento (VMWare)",
        "ports_in_use": "Puertos en Uso"
      },
      "logs": {
        "title": "Registro de Logs",
        "search_placeholder": "Buscar en logs...",
        "level": "Nivel",
        "source": "Origen",
        "message": "Mensaje",
        "timestamp": "Fecha/Hora",
        "resolve": "Resolver"
      },
      "common": {
        "loading": "Cargando...",
        "error": "Error",
        "online": "En línea",
        "offline": "Fuera de línea",
        "warning": "Advertencia"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "databases": "Databases",
        "windows": "Windows",
        "linux": "Linux",
        "logs": "Logs",
        "home": "Home"
      },
      "dashboard": {
        "title": "Infrastructure Dashboard",
        "total_systems": "Total Systems",
        "active_systems": "Active Systems",
        "critical_alerts": "Critical Alerts",
        "health_score": "Health Score",
        "overview": "Overview",
        "status": "Status"
      },
      "databases": {
        "title": "Databases",
        "active_connections": "Active Connections",
        "blocked_users": "Blocked Users",
        "tablespace_usage": "Tablespace Usage",
        "log_size": "Log Size",
        "service_status": "Service Status"
      },
      "windows": {
        "title": "Windows Systems",
        "iis_services": "IIS Services",
        "performance": "Performance (VMWare)",
        "ports_in_use": "Ports in Use"
      },
      "logs": {
        "title": "Logs Registry",
        "search_placeholder": "Search logs...",
        "level": "Level",
        "source": "Source",
        "message": "Message",
        "timestamp": "Timestamp",
        "resolve": "Resolve"
      },
      "common": {
        "loading": "Loading...",
        "error": "Error",
        "online": "Online",
        "offline": "Offline",
        "warning": "Warning"
      }
    }
  },
  pt: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "databases": "Bases de Dados",
        "windows": "Windows",
        "linux": "Linux",
        "logs": "Logs",
        "home": "Início"
      },
      "dashboard": {
        "title": "Painel de Controle de Infraestrutura",
        "total_systems": "Sistemas Totais",
        "active_systems": "Sistemas Ativos",
        "critical_alerts": "Alertas Críticas",
        "health_score": "Pontuação de Saúde",
        "overview": "Resumo Geral",
        "status": "Status"
      },
      "databases": {
        "title": "Bases de Dados",
        "active_connections": "Conexões Ativas",
        "blocked_users": "Usuários Bloqueados",
        "tablespace_usage": "Uso de Tablespace",
        "log_size": "Tamanho do Log",
        "service_status": "Status do Serviço"
      },
      "windows": {
        "title": "Sistemas Windows",
        "iis_services": "Serviços IIS",
        "performance": "Desempenho (VMWare)",
        "ports_in_use": "Portas em Uso"
      },
      "logs": {
        "title": "Registro de Logs",
        "search_placeholder": "Buscar nos logs...",
        "level": "Nível",
        "source": "Origem",
        "message": "Mensagem",
        "timestamp": "Data/Hora",
        "resolve": "Resolver"
      },
      "common": {
        "loading": "Carregando...",
        "error": "Erro",
        "online": "Online",
        "offline": "Offline",
        "warning": "Aviso"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
