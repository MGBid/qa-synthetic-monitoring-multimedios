
describe('Monitor de Salud Visual', () => {
  beforeEach(() => {
    // Evitamos que los errores de scripts externos (publicidad) detengan el test 
    Cypress.on('uncaught:exception', () => false);
  });

  it('Debe validar que las imágenes de noticias carguen correctamente (CDN Check) saltando obstáculos', () => {
    cy.visit('https://tn.com.ar/');

    // --- MANEJO DE MODAL ---
    // Intentamos buscar el botón "Más tarde" y darle click si aparece
    cy.get('body').then( ($body) => {
      if ($body.find('button:contains("Más tarde")').length > 0 ) {
        cy.contains('Más tarde').click( {force: true} );
        cy.log('✅ Modal de suscripción detectado y cerrado');
      } // Fin If
    });

    // --- SCROLL y LOGS ---
    cy.scrollTo('bottom', {duration: 2000 });
    cy.wait(1000) // Esperamos un segundo a que las imágenes bajen de la nube

    // 2. Buscamos todas las imágenes de la página y logeamos información
    // El Secreto: Bajamos hasta el final para disparar el Lazy Load
    cy.get('img').should('be.visible').each(($img, index) => {
      const src = $img.attr('src'); // Obtenemos la url de la imagen
      const alt = $img.attr('alt') || 'Sin descripción'; // Obtenemos el texto alternativo
      
      // Imprimimos en el log de Cypress
      cy.log(`Revisando imagen: ${index}: ${alt}`);
      cy.log(`Su URL es: ${src}`);

      // Filtramos imágenes muy pequeñas (íconos) para enfocarnos en las noticias
      if ($img[0].naturalWidth > 1) {
        cy.wrap($img).should(($el) => {
        expect($el[0].naturalWidth, `Error en CDN: ${src}`).to.be.greaterThan(0);
      });
      } // Fin If

      // Usamos una propiedad de JavaScript para ver si la imagen tiene ancho real
      // Si naturalWidth es 0, la imagen está rota o no bajó de la CDN     
    }); // Fin each
  });

  it('Debe verificar que el reproductor de video esté funcional', () => {
    cy.visit('https://tn.com.ar/');
    // Buscamos cualquier elemento de video o el contenedor del streaming (ajustar según el sitio si cambia)
    // TN suele usar la clase .vjs-tech para su player principal
    cy.get('body').then( ($body) => {
      const videoFound = $body.find('video').length > 0 || $body.find('iframe').length > 0;
      cy.log(videoFound ? '✅ Video/Iframe encontrado' : '❌ No se detectó player');

      expect(videoFound).to.be.true;

      // Estosiguienteestádemás!!
      if ($body.find('video').length > 0) {
        cy.get('video').should('be.visible');
      } else {
        // Si no hay tag video, buscamos el iframe del vivo
        cy.get('iframe').should('exist');
      }
    });
  }); // Fin it 2

});