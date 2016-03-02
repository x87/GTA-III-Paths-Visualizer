<?php

class Cache
{

    const CACHE_DIR = __DIR__;
    private $key;

    public function __construct($key)
    {
        $this->key = $key;
    }

    public function add($data)
    {
        file_put_contents($this->getCacheFile($this->key), serialize($data));
    }

    public function get()
    {
        $filename = $this->getCacheFile($this->key);
        if (!file_exists($filename)) {
            return false;
        }
        return unserialize(file_get_contents($filename));
    }

    private function getCacheFile($key)
    {
        return self::CACHE_DIR . DIRECTORY_SEPARATOR . 'cache'
        . DIRECTORY_SEPARATOR . $key . '.cache';
    }
}
