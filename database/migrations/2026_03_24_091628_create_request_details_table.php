<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('RequestDetails', function (Blueprint $table) {
            $table->id();
            // Foreign Key to link to the RequestHeaders table
            $table->unsignedBigInteger('Request_ID'); 
            
            $table->string('StoreCode');
            $table->string('StoreName');
            $table->string('PLU');
            $table->string('ItemDescription');
            $table->string('Location')->nullable();
            $table->string('Tail1')->nullable();
            $table->string('C2')->nullable();
            $table->integer('Quantity');
            $table->integer('OH_AfterAllocation');
            $table->timestamps();

            // Optional: Ensure if a Header is deleted, details are too
            $table->foreign('Request_ID')->references('Request_ID')->on('RequestHeaders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_details');
    }
};
