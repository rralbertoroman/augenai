# Tareas Futuras

## Despliegue

- [ ] **Optimización de Docker**: Reducir aún más el tamaño de las imágenes usando compilaciones de PyTorch específicas para CPU si no se requiere GPU, o usando compilaciones multi‑etapa de forma más agresiva.

## Tablero

- [ ] **Mejorar estadísticas de pacientes y enfermedades**: Añadir filtros para mejorar la eficiencia en el rango de exploración, dado que actualmente muestra todas las predicciones y en el futuro esto podría incrementar significativamente los tiempos de carga.
- [ ] **Analítica de lesiones**: Proveer información sobre la tasa de aparición de lesiones y su ubicación en la retina para ayudar a detectar patrones.
- [ ] **Análisis del historial clínico**: Aprovechar LLMs para ofrecer información sobre el historial clínico del paciente.
- [ ] **Mejorar filtrado en el panel de estadísticas del modelo**: Permitir al usuario filtrar las predicciones por edad del paciente, género e información clínica para detectar errores de predicción específicos del modelo.

## Página de Predicciones (lista)

- [ ] **Crear modal para retroalimentación de detección**: En un modal interactivo permitir al usuario añadir, mover, renombrar, redimensionar y eliminar cajas delimitadoras para corregir las predicciones.
- [ ] **Agregar filtros y ordenamiento**: Permitir al usuario filtrar las predicciones por edad del paciente, género, tarea e información clínica.
- [ ] **Agregar paginación**: Permitir al usuario navegar a través de las predicciones.

## Post-procesamiento

- [ ] **Implementar el módulo de generación de Datasets**: Este módulo se utilizará para generar nuevos conjuntos de datos, facilitando el entrenamiento de modelos adicionales.
- [ ] **Integrar nuevos modelos**: Añadir modelos adicionales para expandir la cobertura de enfermedades detectadas.