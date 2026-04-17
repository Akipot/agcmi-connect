<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function getRoles(): JsonResponse
    {
        $roles = DB::table('roles as a')
            ->leftJoin('member_details as b', 'a.insertBy', '=', 'b.user_id')
            ->select([
                'a.role_id', 
                'a.role', 
                'a.isActive', 
                'a.insertDate', 
                'b.FirstName as firstName'
            ])
            ->orderBy('a.insertDate', 'desc')
            ->get();

        return response()->json($roles);
    }

    /**
     * Store a new role
     */
    public function storeRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role'   => 'required|string|max:255|unique:roles,role',
            'isActive' => 'required|boolean',
        ]);

        try {
            $userId = auth()->id();
            $now    = now();

            $params = [
                'role'     => $validated['role'],
                'isActive'   => $validated['isActive'],
                'insertBy'   => $userId,
                'insertDate' => $now,
                'updateBy'   => $userId,
                'updateDate' => $now,
            ];

            DB::table('roles')->insert($params);

            return response()->json(['message' => 'Role registered successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update existing role
     */
    public function updateRole(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|unique:roles,role,' . $id . ',role_id',
            'isActive' => 'required|boolean',
        ]);

        $role->update($validated);

        return response()->json($role);
    }
}
