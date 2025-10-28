import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Mensaje({nombre}){

    return(
        <div className="alert alert-primary text-center">
            ¡Hola {nombre}, bienvenido al sistema!
        </div>
    );

};