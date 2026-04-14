<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Exception;
use PhpOffice\PhpSpreadsheet\Reader\Gnumeric\PageSetup;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Pdf\Dompdf;
use PhpOffice\PhpSpreadsheet\Writer\Pdf\Mpdf;
use PhpOffice\PhpSpreadsheet\Writer\Pdf\Tcpdf;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MyHelper
{

    public static function decrypt($data)
    {
        $hashKey = 'atp_dev';

        $METHOD = 'aes-256-cbc';
        $IV = chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0);
        $key = substr(hash('sha256', $hashKey, true), 0, 32);
        $decrypted = openssl_decrypt(base64_decode($data), $METHOD, $key, OPENSSL_RAW_DATA, $IV);

        return $decrypted;
    }

    public static function passwordEncrypt($username, $password)
    {
        $method = 'aes-256-cbc';
        // Must be exact 32 chars (256 bit)
        $hashed = substr(hash('sha256', $password, true), 0, 32);
        // IV must be exact 16 chars (128 bit)
        $iv = chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0);
        // av3DYGLkwBsErphcyYp+imUW4QKs19hUnFyyYcXwURU=
        $password = base64_encode(openssl_encrypt($username, $method, $hashed, OPENSSL_RAW_DATA, $iv));

        return $password;
    }

    private static function decodeNestedJson(&$array)
    {
        foreach ($array as $key => &$value) {
            if (is_array($value)) {
                // Recursively decode nested arrays
                self::decodeNestedJson($value);
            } elseif (is_string($value)) {
                // Attempt to decode JSON strings
                $decoded = json_decode($value, true);
                if (is_array($decoded) && json_last_error() == JSON_ERROR_NONE) {
                    // Replace the string with the decoded array/object
                    $array[$key] = $decoded;
                    // Recursively decode the newly decoded array/object
                    self::decodeNestedJson($array[$key]);
                }
            }
        }

        return $array;
    }
    public static function checkUserAccess($data, $actionIDs)
    {
        if (Session::has('UserAccess')) {
            if (is_array($actionIDs)):
                foreach ($data['userAccess'] as $access):
                    if ($access['Module_ID'] == $data['moduleID'] && $access['Action_ID'] == 1):
                        return true;
                    endif;
                    if ($access['Module_ID'] == $data['moduleID']):
                        if (in_array($access['Action_ID'], $actionIDs)):
                            return true;
                        endif;
                    endif;
                endforeach;
            else:
                foreach ($data['userAccess'] as $access):
                    if ($access['Module_ID'] == $data['moduleID'] && $access['Action_ID'] == 1):
                        return true;
                    endif;
                    if (
                        $access['Action_ID']  ==  $actionIDs &&
                        $access['Module_ID'] == $data['moduleID']
                    ):
                        return true;
                    endif;
                endforeach;
            endif;
            return false;
        } else {
            return redirect()->away(env('MYHUB_URL'));
        }
    }
    public static function decryptMyHUB($data)
    {
        $password = 'atp_dev';

        $method = 'aes-256-cbc';
        // Must be exact 32 chars (256 bit)
        $$password = substr(hash('sha256', $password, true), 0, 32);
        // IV must be exact 16 chars (128 bit)
        $iv = chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) .
            chr(0x0);

        // av3DYGLkwBsErphcyYp+imUW4QKs19hUnFyyYcXwURU=
        $decrypted = openssl_decrypt(base64_decode($data), $method, $password, OPENSSL_RAW_DATA, $iv);

        return $decrypted;
    }

    public static function encrypt($data)
    {
        $hashKey = 'atp_dev';

        $METHOD = 'aes-256-cbc';
        $IV = chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0) . chr(0x0);
        $key = substr(hash('sha256', $hashKey, true), 0, 32);
        $encrypt = base64_encode(openssl_encrypt($data, $METHOD, $key, OPENSSL_RAW_DATA, $IV));

        return $encrypt;
    }
    public static function checkSession()
    {
        if (Session::has('UserAccess')) {
            return true;
        } else {
            return abort(403);
        }
    }
    public static function decodeDBJson($queryResult)
    {
        $fullJson = '';
        foreach ($queryResult as $var => $val) {
            $jsonKey = array_key_first(get_object_vars($val));
            $fullJson .= get_object_vars($val)[$jsonKey];
        }

        // dd($fullJson);
        $decoded = json_decode($fullJson, true);

        // Check if decoding was successful
        if (json_last_error() != JSON_ERROR_NONE) {
            throw new Exception('Error decoding JSON: ' . json_last_error_msg());
        }

        // foreach ($decoded as $var => $val) {
        //     if (is_array($val) || (json_decode($val) && json_last_error() != JSON_ERROR_NONE)) {
        //         // Decode the JSON string
        //         $decoded[$var] = self::decodeNestedJson($val);
        //     } else {
        //         // The value is not a JSON-encoded string, handle accordingly
        //         $decoded[$var] = $val;
        //     }
        // }

        // foreach ($decoded as $var => $val) {
        //     if (is_array($val)) {
        //         // If the value is an array, decode it recursively
        //         $decoded[$var] = self::decodeNestedJson($val);
        //     } elseif (is_string($val)) {
        //         // Attempt to decode JSON strings
        //         $decodedValue = json_decode($val, true);
        //         if (json_last_error() == JSON_ERROR_NONE) {
        //             // Replace the string with the decoded array/object and decode further if needed
        //             $decoded[$var] = self::decodeNestedJson($decodedValue);
        //         } else {
        //             // The value is not a JSON-encoded string, keep it as is
        //             $decoded[$var] = $val;
        //         }
        //     } else {
        //         // The value is not an array or JSON-encoded string, keep it as is
        //         $decoded[$var] = $val;
        //     }
        // }

        return self::decodeNestedJson($decoded);
    }

    public static function userHasModuleRoleAccess(int|string $roleID, int|string $moduleID, string $action)
    {
        $moduleAccess = DB::connection('usermgt_db')->select('EXEC sp_User_ModuleRole_Get ?, ?, ?, ?', [0, env('APP_ID'), $moduleID, $roleID]);
        if ($moduleAccess && !empty($moduleAccess)) {
            $actionNames = array_map('strtolower', array_column($moduleAccess, 'ActionName'));
            $lowerAction = strtolower($action);
            if (in_array($lowerAction, $actionNames) || strtolower($moduleAccess[0]->ActionName) == 'all') {
                return true;
            }
        }
        return false;
    }

    /**
     * Executes a stored procedure and returns the result.
     *
     * @param string $procedureName The name of the stored procedure.
     * @param array $parameters An associative array of parameters.
     * @return array The result set.
     */

    public static function generateQM($data)
    {
        $totalParams = count($data);
        if ($totalParams == 0):
            return '';
        else:
            $param = '';
            foreach ($data as $d):
                $param .= '?,';
            endforeach;
            return substr($param, 0, -1);
        endif;
    }

    public static function executeStoredProcedure(string $procedureName, array $parameters = []): array
    {
        // Build the parameter placeholders
        $placeholders = implode(', ', array_map(function ($param) {
            return '?';
        }, array_keys($parameters)));

        // Prepare the SQL statement
        $sql = "EXEC $procedureName $placeholders";

        // Execute the stored procedure
        $results = DB::selectResultSets($sql, array_values($parameters));

        return json_decode(json_encode($results), true);
    }

    public static function groupAuditAreas(array $data, ?int $parentId = null): array
    {
        // return $areas;

        $filteredData = array_values(array_filter($data, function ($item) use ($parentId) {
            // dd($item);
            return $item['parent']['id'] == $parentId;
        }));

        return array_map(function ($item) use ($data) {
            $children = self::groupAuditAreas($data, $item['id']);
            if (count($children) > 0) {
                return array_merge($item, ['subAreas' => $children]);
            } else {
                return array_merge($item, ['subAreas' => []]);
            }
        }, $filteredData);
    }


    public static function isImageFileOrDataURL($imageData)
    {
        if (is_string($imageData)) {
            // Check if it starts with "data:"
            if (strpos($imageData, 'data:') === 0) {
                // Check if it has a valid MIME type and base64 encoding
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData)) {
                    return 'DataURL';
                }
            }
        } elseif (is_uploaded_file($imageData)) {
            // Check if it's a valid uploaded file
            return 'File';
        }

        return false;
    }

    public static function checkPosition($deptid, $posid)
    {
        if ($deptid == 17) {
            if ($posid == 3) {
                return 1;
            } else if ($posid == 5) {
                return 5;
            } else {
                return 2;
            }
        } else {
            return 3;
        }
    }
}
