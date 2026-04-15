<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Module;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ModuleController extends Controller
{
    public function getModules(): JsonResponse
    {
        $modules = DB::table('modules as a')
            ->leftJoin('member_details as b', 'a.insertBy', '=', 'b.user_id')
            ->select([
                'a.module_id', 
                'a.module', 
                'a.isActive', 
                'a.insertDate', 
                'b.FirstName as firstName'
            ])
            ->orderBy('a.insertDate', 'desc')
            ->get();

        return response()->json($modules);
    }

    /**
     * Store a new module
     */
    public function storeModule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module'   => 'required|string|max:255|unique:modules,module',
            'isActive' => 'required|boolean',
        ]);

        try {
            $userId = auth()->id();
            $now    = now();

            $params = [
                'module'     => $validated['module'],
                'isActive'   => $validated['isActive'],
                'insertBy'   => $userId,
                'insertDate' => $now,
                'updateBy'   => $userId,
                'updateDate' => $now,
            ];

            DB::table('modules')->insert($params);

            return response()->json(['message' => 'Module registered successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update existing module
     */
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'module' => 'required|string|unique:modules,module,' . $id . ',module_id',
            'isActive' => 'required|boolean',
        ]);

        $module->update($validated);

        return response()->json($module);
    }
}
