// Seleccionamos la base de datos (se crea automáticamente al insertar datos)
use('condo_notify_db');

// Limpiamos las colecciones para que puedas ejecutar este script varias veces sin duplicar datos
db.condominios.drop();
db.usuarios.drop();
db.reportes.drop();
db.eventos_conserjeria.drop();


// 1. CREATE en colección "condominios" (Torres + Departamentos anidados)

db.condominios.insertOne({
    "nombre_torre": "Torre A",
    "cantidad_pisos": 23,
    "cantidad_deptos_x_piso": 15,
    "departamentos": [
        {
            "numero_depto": 2203,
            "piso": 22,
            "estado": "Ocupado"
        }
    ]
})


db.condominios.insertOne({
  "nombre_torre": "Torre A",
  "cantidad_pisos": 5,
  "cantidad_deptos_x_piso": 4,
  "departamentos": [
    {
      "id_depto": 101,
      "numero_depto": "101",
      "piso": 1,
      "estado": "Disponible"
    }
  ]
});

// 2. CREATE en colección "usuarios" (Usuarios + Roles + Propiedades anidados)
db.usuarios.insertMany([
  {
    "_id": "11111111-1",
    "nombre_completo": "Pedro Conserje",
    "email": "pedro@condo.cl",
    "contrasena_hash": "hash123",
    "activo": "S",
    "rol": {
      "id_rol": 2,
      "nombre_rol": "Conserje",
      "descripcion": "Personal de conserjería"
    }
  },
  {
    "_id": "22222222-2",
    "nombre_completo": "Maria Residente",
    "email": "maria@condo.cl",
    "contrasena_hash": "hash123",
    "activo": "S",
    "rol": {
      "id_rol": 3,
      "nombre_rol": "Residente",
      "descripcion": "Dueño o arrendatario"
    },
    "propiedades_asociadas": [
      {
        "id_depto": 101,
        "torre": "Torre A",
        "numero_depto": "101",
        "es_propietario": "S"
      }
    ]
  }
]);

// 3. CREATE en colección "reportes" (Reporte + Categoría + Historial de estados)
db.reportes.insertOne({
  "residente": {
    "rut": "22222222-2",
    "nombre_completo": "Maria Residente",
    "depto_info": "Torre A - 101"
  },
  "categoria": {
    "nombre_categoria": "Corte de Agua",
    "tiempo_resolucion_estimado": 24
  },
  "descripcion": "Fuga de agua en el baño principal",
  "prioridad": "Alta",
  "fecha_creacion": new Date(),
  "historial_estados": [
    {
      "estado": "Pendiente",
      "rut_usuario": "11111111-1",
      "comentario": "Reporte ingresado por conserjería",
      "fecha_cambio": new Date()
    }
  ]
});

// 4. CREATE en colección "eventos_conserjeria" (Ejemplo de Delivery)
db.eventos_conserjeria.insertOne({
  "tipo_evento": "Delivery",
  "conserje": {
    "rut": "11111111-1",
    "nombre": "Pedro Conserje"
  },
  "depto_destino": {
    "id_depto": 101,
    "numero_depto": "101",
    "torre": "Torre A"
  },
  "detalles": {
    "rut_residente": "22222222-2",
    "tipo_paquete": "Caja mediana",
    "descripcion": "Pedido de supermercado",
    "entregado": "N",
    "hora_registro": new Date()
  }
});


//CONSULTAS CRUD
db.usuarios.insertOne({
    "_id": "18784860-1",
    "nombre_completo": "Damian Slavko Marro Udovic",
    "email": "da.marro@duocuc.cl",
    "contrasena_hash": "129D6A19d.",
    "activo": "S",
    "rol": {
        "id_rol": "3",
        "nombre_rol": "Residente",
        "descripcion": "Dueño o arrendatario"
    },
    "propiedades_asociadas": [
        {
            "id_depto": "2203",
            "torre": "Torre A",
            "numero_depto": "2203",
            "es_propietario": "N"
        }
    ]

});

db.usuarios.find().toArray(); // Muestra todos los usuarios


db.condominios.deleteOne({ // Elimina la torre A por duplicidad de datos
    "nombre_torre": "Torre A",
    "cantidad_pisos": 23
});


db.usuarios.find({
    "rol.nombre_rol": "Residente"
}).toArray(); // Muestra todos los usuarios con rol residente

db.usuarios.find(
    {},//filtro vacio: trae todos los documentos
    { contrasena_hash: 0 } // Excluye el campo contrasena_hash de los resultados
).toArray();

db.reportes.find({
    "prioridad": "Alta"
}).toArray(); // Muestra todos los reportes con prioridad alta

db.eventos_conserjeria.find({
    "tipo_evento": "Delivery",
    "detalles.entregado": "N"
}).toArray(); // Muestra todos los eventos de delivery no entregados



db.eventos_conserjeria.updateOne(
    {
        "tipo_evento": "Delivery",
        "depto_destino.numero_depto": "101",
        "detalles.entregado": "N"
    },
    {
        $set: { // Actualiza el estado de entrega a "S" y agrega la fecha de entrega
            "detalles.entregado": "S",
            "detalles.fecha_entrega": new Date()// Agrega la fecha de entrega
        }
    }
);

db.reportes.updateOne(
    {"residente.rut": "22222222-2"},
    {
        $push: {
            "historial_estados": {
                "estado": "En Proceso",
                "rut_usuario": "11111111-1",
                "comentario": "El conserje está gestionando el reporte",
                "fecha_cambio": new Date()
            }
        }
    }
);

db.reportes.findOne({"residente.rut": "22222222-2"});//consulta para verificar que se haya agregado el historial de estados correctamente



db.usuarios.deleteOne({"_id": "18784860-0"}); // Elimina el usuario con rut 18784860-0 (cree duplicado por error de tipeo, el rut correcto es 18784860-1, por lo que este delete no afectará a ningún documento)


db.usuarios.deleteOne({"_id": ObjectId("6b05575c355c7b0231098847")}); // se elimina usuario ya respetar id por rut 


db.usuarios.updateOne(// Actualiza el número de departamento del usuario con rut 18784860-1
    {
        "_id": "18784860-1",
        "propiedades_asociadas.numero_depto": "2203"
    },
    {
        $set: {
            "propiedades_asociadas.$.numero_depto": "2203"// Actualiza el número de departamento a "2203"
        }
    }    
);

