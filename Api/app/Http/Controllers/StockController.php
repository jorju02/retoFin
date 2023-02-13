<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    //
    public function index()
    {
        $stocks = Stock::all();

        return response()->json($stocks);
    }
    public function lastData()
    {
        $query = "SELECT stock.*, empresas.nombre FROM stock INNER JOIN empresas ON stock.empresas_id = empresas.id WHERE fecha=(SELECT MAX(fecha) AS 'Ultima fecha' FROM `stock`);";
        $data = DB::select($query);
        
        // Return the data as a JSON response
        return response()->json([
            'data' => $data
        ]);
    }
    public function stockAno()
    {
        $query = "SELECT t2.id, t2.nombre, AVG(t1.valor) as media_valor, DATE_FORMAT(t1.fecha, '%m') as mes 
        FROM stock t1 
        JOIN empresas t2 ON t2.id = t1.empresas_id 
        GROUP BY t1.empresas_id, mes 
        ORDER BY t1.empresas_id, mes;";
        $data = DB::select($query);
        
        // Return the data as a JSON response
        return response()->json([
            'data' => $data
        ]);
    }

 

    
}
