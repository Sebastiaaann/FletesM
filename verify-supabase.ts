/**
 * Script de verificación de Supabase
 * Ejecuta este archivo para verificar que tu integración de Supabase esté funcionando correctamente
 */

import { supabase, testSupabaseConnection } from './services/supabaseClient';
import { vehicleService, driverService, routeService } from './services/databaseService';

console.log('🔍 Iniciando verificación de Supabase...\n');

async function verifySupabase() {
    let allPassed = true;

    // Test 1: Verificar variables de entorno
    console.log('📋 Test 1: Verificando variables de entorno...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ FALLO: Variables de entorno no configuradas');
        console.log('   Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local\n');
        allPassed = false;
    } else {
        console.log('✅ Variables de entorno configuradas correctamente');
        console.log(`   URL: ${supabaseUrl}`);
        console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);
    }

    // Test 2: Verificar conexión
    console.log('📋 Test 2: Verificando conexión a Supabase...');
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
        console.error('❌ FALLO: No se pudo conectar a Supabase');
        console.log('   Verifica que las credenciales sean correctas\n');
        allPassed = false;
    } else {
        console.log('✅ Conexión exitosa a Supabase\n');
    }

    // Test 3: Verificar tabla vehicles
    console.log('📋 Test 3: Verificando tabla vehicles...');
    try {
        const vehicles = await vehicleService.getAll();
        console.log(`✅ Tabla vehicles accesible (${vehicles?.length || 0} registros)\n`);
    } catch (error: any) {
        console.error('❌ FALLO: Error al acceder a tabla vehicles');
        console.error(`   ${error.message}\n`);
        allPassed = false;
    }

    // Test 4: Verificar tabla drivers
    console.log('📋 Test 4: Verificando tabla drivers...');
    try {
        const drivers = await driverService.getAll();
        console.log(`✅ Tabla drivers accesible (${drivers?.length || 0} registros)\n`);
    } catch (error: any) {
        console.error('❌ FALLO: Error al acceder a tabla drivers');
        console.error(`   ${error.message}\n`);
        allPassed = false;
    }

    // Test 5: Verificar tabla routes
    console.log('📋 Test 5: Verificando tabla routes...');
    try {
        const routes = await routeService.getAll();
        console.log(`✅ Tabla routes accesible (${routes?.length || 0} registros)\n`);
    } catch (error: any) {
        console.error('❌ FALLO: Error al acceder a tabla routes');
        console.error(`   ${error.message}\n`);
        allPassed = false;
    }

    // Test 6: Verificar operación de escritura (crear y eliminar)
    console.log('📋 Test 6: Verificando operaciones de escritura...');
    try {
        const testVehicle = {
            plate: 'TEST-999',
            brand: 'Test Brand',
            model: 'Test Model',
            year: 2024,
            vehicle_type: 'Semi-trailer',
            status: 'Active' as const,
        };

        const created = await vehicleService.create(testVehicle);
        console.log('✅ Operación CREATE exitosa');

        if (created?.id) {
            await vehicleService.delete(created.id);
            console.log('✅ Operación DELETE exitosa\n');
        }
    } catch (error: any) {
        console.error('❌ FALLO: Error en operaciones de escritura');
        console.error(`   ${error.message}\n`);
        allPassed = false;
    }

    // Resumen final
    console.log('═══════════════════════════════════════════════════');
    if (allPassed) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON!');
        console.log('✅ Tu integración de Supabase está funcionando correctamente');
    } else {
        console.log('⚠️  ALGUNOS TESTS FALLARON');
        console.log('Por favor revisa los errores arriba y sigue la guía de integración');
    }
    console.log('═══════════════════════════════════════════════════\n');
}

// Ejecutar verificación
verifySupabase().catch(console.error);
