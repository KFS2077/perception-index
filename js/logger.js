// Logger system
const logger = {
    info: (message) => {
        console.log(`%c[INFO] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #4361ee');
    },
    success: (message) => {
        console.log(`%c[SUCCESS] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #38b000');
    },
    warning: (message) => {
        console.log(`%c[WARNING] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #f48c06');
    },
    error: (message, error) => {
        console.error(`%c[ERROR] ${new Date().toLocaleTimeString()} - ${message}`, 'color: #d00000', error);
    },
    db: (operation, details) => {
        console.log(`%c[DATABASE] ${new Date().toLocaleTimeString()} - ${operation}`, 'color: #3a0ca3', details);
    }
};

export default logger;
