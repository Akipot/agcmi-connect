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
        Schema::create('RequestHeaders', function (Blueprint $table) {
            $table->id('Request_ID'); 
            $table->string('RequestNo');
            $table->dateTime('DateGenerated');
            $table->integer('TotalStores');
            $table->integer('TotalRequests');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('RequestHeaders');
    }
};
