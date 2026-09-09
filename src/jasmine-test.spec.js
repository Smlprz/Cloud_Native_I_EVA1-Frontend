describe('Pruebas Básicas', function() {
  it('debería sumar correctamente', function() {
    expect(1 + 1).toBe(2);
  });
  
  it('debería restar correctamente', function() {
    expect(5 - 3).toBe(2);
  });
  
  it('debería verificar valores truthy', function() {
    expect(true).toBe(true);
    expect(1).toBeTruthy();
  });
});