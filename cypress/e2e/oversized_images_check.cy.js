const urls = [
  { name: 'Desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'Desktop-1366x768', width: 1366, height: 768 },
  { name: 'Mobile-Android', width: 360, height: 740, userAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 2)' },
  { name: 'Mobile-iPhone', width: 375, height: 812, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)' }
];

const THRESHOLD = 1.2; // 20% más grande que el tamaño mostrado

urls.forEach((device) => {
  describe(`Chequeo de imágenes en tn.com.ar - ${device.name}`, () => {
    beforeEach(() => {
      cy.viewport(device.width, device.height);
      if (device.userAgent) {
        cy.visit('https://tn.com.ar/', { headers: { 'User-Agent': device.userAgent } });
      } else {
        cy.visit('https://tn.com.ar/');
      }
      Cypress.on('uncaught:exception', () => false);
    });

    it('Detecta imágenes sobredimensionadas y captura screenshot', () => {
      cy.wait(5000); // Espera para publicidad
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Más tarde")').length > 0) {
          cy.contains('Más tarde').click({ force: true });
        } else if ($body.find('button:contains("Aceptar")').length > 0) {
          cy.contains('Aceptar').click({ force: true });
        }
      });
      cy.wait(2000); // Espera para lazy load

      cy.get('img:visible').each(($img, index) => {
        const natural = $img[0].naturalWidth;
        const shown = $img[0].width;
        const src = $img.attr('src');
        if (natural > shown * THRESHOLD) {
          cy.writeFile(`sobredimensionadas_tn_${device.name}.log`, `Imagen sobredimensionada: ${src} | Natural: ${natural} | Mostrada: ${shown}\n`, { flag: 'a+' });
          cy.wrap($img).screenshot(`sobredimensionada_${device.name}_${index}`);
        }
      });
    });
  });
});