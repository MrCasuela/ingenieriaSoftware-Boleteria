const { createApp } = Vue;

createApp({
    data() {
        return {
            currentStep: 1,
            processing: false,
            selectedEvent: null,
            selectedTicket: null,
            ticketCode: '',
            serviceCharge: 5.00,
            personalData: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                document: ''
            },
            paymentData: {
                cardNumber: '',
                cardName: '',
                expiry: '',
                cvv: ''
            },
            events: [
                {
                    id: 1,
                    name: 'Concierto Rock en Vivo',
                    description: 'Una noche increíble con las mejores bandas de rock nacional e internacional.',
                    date: '15 de Noviembre, 2025',
                    location: 'Estadio Nacional',
                    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
                    minPrice: 50,
                    tickets: [
                        {
                            id: 1,
                            name: 'Entrada General',
                            description: 'Acceso a la zona general del estadio',
                            price: 50,
                            available: 500
                        },
                        {
                            id: 2,
                            name: 'Entrada VIP',
                            description: 'Acceso preferencial con bebida incluida',
                            price: 120,
                            available: 100
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Festival de Comida Gourmet',
                    description: 'Disfruta de los mejores platos de chefs reconocidos internacionalmente.',
                    date: '22 de Noviembre, 2025',
                    location: 'Centro de Convenciones',
                    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
                    minPrice: 30,
                    tickets: [
                        {
                            id: 3,
                            name: 'Entrada Básica',
                            description: 'Acceso al festival sin degustaciones',
                            price: 30,
                            available: 300
                        },
                        {
                            id: 4,
                            name: 'Entrada Premium',
                            description: 'Acceso completo con degustaciones incluidas',
                            price: 75,
                            available: 150
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'Conferencia de Tecnología',
                    description: 'Los líderes tecnológicos más importantes compartirán sus conocimientos.',
                    date: '5 de Diciembre, 2025',
                    location: 'Auditorio Universitario',
                    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
                    minPrice: 25,
                    tickets: [
                        {
                            id: 5,
                            name: 'Entrada Estudiante',
                            description: 'Acceso con descuento para estudiantes',
                            price: 25,
                            available: 200
                        },
                        {
                            id: 6,
                            name: 'Entrada Profesional',
                            description: 'Acceso completo con material adicional',
                            price: 60,
                            available: 100
                        }
                    ]
                }
            ]
        }
    },
    computed: {
        totalAmount() {
            if (!this.selectedTicket) return 0;
            return this.selectedTicket.price + this.serviceCharge;
        },
        progressWidth() {
            return (this.currentStep - 1) * 33.33;
        }
    },
    methods: {
        selectEvent(event) {
            this.selectedEvent = event;
            this.currentStep = 2;
        },
        selectTicket(ticket) {
            this.selectedTicket = ticket;
        },
        proceedToPersonalData() {
            if (this.selectedTicket) {
                this.currentStep = 3;
            }
        },
        async processPayment() {
            this.processing = true;
            
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generar código de entrada único
            this.ticketCode = 'TKT-' + Date.now().toString().slice(-8);
            
            this.processing = false;
            this.currentStep = 4;
            
            // Generar QR después de que la vista se haya renderizado
            this.$nextTick(() => {
                this.generateQR();
            });
        },
        generateQR() {
            const canvas = document.getElementById('qrcode');
            if (canvas) {
                const qrData = {
                    ticketCode: this.ticketCode,
                    event: this.selectedEvent.name,
                    date: this.selectedEvent.date,
                    location: this.selectedEvent.location,
                    ticketType: this.selectedTicket.name,
                    holder: `${this.personalData.firstName} ${this.personalData.lastName}`,
                    document: this.personalData.document
                };
                
                QRCode.toCanvas(canvas, JSON.stringify(qrData), { width: 250 }, (error) => {
                    if (error) console.error(error);
                });
            }
        },
        goBack() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },
        getStepClass(step) {
            if (step < this.currentStep) return 'completed';
            if (step === this.currentStep) return 'active';
            return 'inactive';
        },
        downloadTicket() {
            // Simular descarga de entrada
            alert('Descargando entrada... (Funcionalidad de ejemplo)');
        },
        startOver() {
            // Reiniciar el proceso
            this.currentStep = 1;
            this.selectedEvent = null;
            this.selectedTicket = null;
            this.personalData = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                document: ''
            };
            this.paymentData = {
                cardNumber: '',
                cardName: '',
                expiry: '',
                cvv: ''
            };
            this.ticketCode = '';
        }
    },
    mounted() {
        // Formatear número de tarjeta mientras se escribe
        this.$watch('paymentData.cardNumber', (newVal) => {
            let formatted = newVal.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formatted !== newVal) {
                this.paymentData.cardNumber = formatted;
            }
        });
        
        // Formatear fecha de vencimiento
        this.$watch('paymentData.expiry', (newVal) => {
            let formatted = newVal.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            if (formatted !== newVal) {
                this.paymentData.expiry = formatted;
            }
        });
    }
}).mount('#app');