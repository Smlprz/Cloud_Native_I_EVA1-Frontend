// src/setup.test.js
import React from 'react';

// Usamos la sintaxis de Jasmine: describe y it
describe("Verificación de Configuración", function() {

  // Una prueba simple para garantizar que Jasmine funciona
  it("debería pasar una prueba básica de suma", function() {
    const a = 5;
    const b = 3;
    
    // Esto es un 'matcher' de Jasmine
    expect(a + b).toBe(8); 
  });
  
  // Prueba un componente simple de React (solo para verificar que el JSX se compile)
  it("debería entender la sintaxis JSX de React", function() {
    // Esto es un elemento JSX que debe ser compilado por Babel/Webpack
    const element = <h1>Hola, Prueba!</h1>; 
    
    // Si la prueba llega a esta línea sin un error de sintaxis, 
    // la configuración Babel/Webpack funciona.
    expect(element).toBeDefined();
  });
});