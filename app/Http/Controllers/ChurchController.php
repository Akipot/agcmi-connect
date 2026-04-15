<?php

namespace App\Http\Controllers;

use App\Models\Church;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ChurchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Churches/Index', [
            // Ensure this key matches your React prop name
            'churches' => Church::orderBy('churchName')->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Churches/MASForm');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'churchName'    => 'required|string|max:255',
            'address'       => 'nullable|string',
            'province'      => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:100',
            'contactNumber' => 'nullable|string|max:50',
            'email'         => 'nullable|email|max:255',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'isActive'      => 'required|boolean',
        ]);

        Church::create($validated);

        return Redirect::route('admin.churches.index')->with('success', 'Church registered successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $church = Church::findOrFail($id);
        
        return Inertia::render('Admin/Churches/MASForm', [
            'church' => $church
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $church = Church::findOrFail($id);

        $validated = $request->validate([
            'churchName'    => 'required|string|max:255',
            'address'       => 'nullable|string',
            'province'      => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:100',
            'contactNumber' => 'nullable|string|max:50',
            'email'         => 'nullable|email|max:255',
            'latitude'      => 'nullable|numeric',
            'longitude'     => 'nullable|numeric',
            'isActive'      => 'required|boolean',
        ]);

        $church->update($validated);

        return Redirect::route('admin.churches.index')->with('success', 'Church updated successfully.');
    }
}
