<?php
include_once 'RwV3d.class.php';
include_once 'Cache.class.php';


class PathReader
{
    private $gameDir;
    private $cacheKey;
    private $count;
    /**
     * @return mixed
     */
    public function getCacheKey()
    {
        return $this->cacheKey;
    }

    /**
     * @param mixed $cacheKey
     */
    public function setCacheKey($cacheKey)
    {
        $this->cacheKey = $cacheKey;
    }

    /**
     * @return mixed
     */
    public function getGameDir()
    {
        return $this->gameDir;
    }

    /**
     * @param $gameDir
     */
    public function setGameDir($gameDir)
    {
        $this->gameDir = $gameDir;
    }

    /**
     * @param        $line
     * @param string $separator
     *
     * @return array
     */
    public function splitString($line, $separator = ',')
    {
        $result = array();
        $strings = explode($separator, $line);
        foreach ($strings as $string) {

            $result[] = trim($string);
        }
        return $result;
    }

    /**
     * @param $name
     * @param $section
     * @param $folder
     *
     * @return array
     */
    public function parseFile($name, $section)
    {

        if (!file_exists($name)) {
            return array();
        }
        $data = file($name);
        $result = array();

        for ($i = 0; $i < count($data); $i++) {
            $line = trim($data[$i]);
            if ($line == $section) {
                for ($j = $i + 1; $j < count($data); $j++, $i++) {
                    $line = trim($data[$j]);
                    if ($line == 'end') {
                        break;
                    }
                    $result[] = $this->splitString($line);
                }
            }
        };
        return $result;
    }

    /**
     * @return array
     */
    public function loadAllInst()
    {
        $result = array();
        if (!is_dir($this->getGameDir())) {
            return $result;
        }

        $baseDir = $this->getGameDir() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'maps';
        $folders = scandir($baseDir);
        foreach ($folders as $folder) {
            if (strpos($folder, '.') === false) {
                $fileName = $baseDir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $folder . '.ipl';
                $data = $this->parseFile($fileName , 'inst');
                foreach ($data as $entry) {
                    $result[] = array(
                        'id'  => $entry[0],
                        'pos' => new RwV3D($entry[2], $entry[3], $entry[4])
                    );
                }

            }
        }

        return $result;
    }

    /**
     * @return array
     */
    public function loadAllPath()
    {
        $result = array();
        if (!is_dir($this->getGameDir())) {
            return $result;
        }

        $baseDir = $this->getGameDir() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'maps';
        $folders = scandir($baseDir);
        foreach ($folders as $folder) {
            if (strpos($folder, '.') === false) {
                $fileName = $baseDir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $folder . '.ide';
                $data = $this->parseFile($fileName, 'path');
                foreach ($data as $index => $entry) {
                    if ($index % 13 == 0) {
                        $id = $entry[1];
                        $ped = $entry[0] == 'ped';
                    } else {
                        if ($entry[0] != 0) {
                            $result[$id][$ped ? 'ped' : 'car'][] = $entry;
                        }
                    }
                }
            }
        }
        return $result;
    }

    /**
     * @param $fileName
     *
     * @return array
     */
    public function loadInstFromFile($fileName)
    {
        $result = array();
        $data = $this->parseFile($fileName , 'inst');
        foreach ($data as $entry) {
            $result[] = array(
                'id'  => $entry[0],
                'pos' => new RwV3D($entry[2], $entry[3], $entry[4])
            );
        }

        return $result;
    }

    /**
     * @param $fileName
     *
     * @return array
     */
    public function loadPathFromFile($fileName)
    {
        $result = array();
        $data = $this->parseFile($fileName, 'path');
        foreach ($data as $index => $entry) {
            if ($index % 13 == 0) {
                $id = $entry[1];
                $ped = $entry[0] == 'ped';
            } else {
                if ($entry[0] != 0) {
                    $result[$id][$ped ? 'ped' : 'car'][] = $entry;
                }
            }
        }
        return $result;
    }

    public function readGta3Dat()
    {
        $gta3dat = file($this->getGameDir() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'gta3.dat');

        $insts = array();
        $paths = array();

        foreach ($gta3dat as $line) {
            $data = $this->splitString($line, ' ');

            if (count($data) < 2) continue;

            $fileName = $this->getGameDir() . DIRECTORY_SEPARATOR . $data[1];

            switch($data[0]) {
                case 'IDE':
                    $data = $this->parseFile($fileName, 'path');
                    foreach ($data as $index => $entry) {
                        if ($index % 13 == 0) {
                            $id = $entry[1];
                            $ped = $entry[0] == 'ped';

                        } else {
                            if ($entry[0] != 0) {
                                $paths[$id][$ped ? 'ped' : 'car'][] = $entry;
                            }
                            if ($entry[0] == 2) {
                                $this->count++;
                            }

                        }
                    }

                    break;
                case 'IPL':
                    $data = $this->parseFile($fileName , 'inst');
                    foreach ($data as $entry) {
                        $insts[] = array(
                            'id'  => $entry[0],
                            'pos' => new RwV3D($entry[2], $entry[3], $entry[4])
                        );
                    }
                    break;
            }
        }
        return $this->mergeAllInstAndPath($insts, $paths);
    }

    /**
     * @param $insts
     * @param $paths
     *
     * @return array
     */
    public function mergeAllInstAndPath($insts, $paths)
    {
        if ($dataFromCache = $this->tryToGetFromCache($this->getCacheKey())) {
            return $dataFromCache;
        }

        $result = $this->mergeInstAndPath($insts, $paths);

        if ($this->getCacheKey()) {
            $cache = new Cache($this->cacheKey);
            $cache->add($result);
        }
        return $result;
    }

    /**
     * @param $inst
     * @param $path
     *
     * @return array
     */
    public function mergeInstAndPath($inst, $path)
    {
        $result = array();

        foreach ($inst as $obj) {
            if (!empty($path[$obj['id']])) {
                $result[] = array(
                    //'id'   => $obj['id'],
                    'pos'  => $obj['pos'],
                    'node' => $path[$obj['id']]
                );
            }
        }

        return $result;
    }

    /**
     * @param $key
     *
     * @return bool|mixed
     */
    private function tryToGetFromCache($key)
    {
        if (!empty($key)) {
            $cache = new Cache($key);
            return $cache->get();
        }
        return false;
    }

}

if (!empty($_POST['gameDir'])) :
    $pathReader = new PathReader();
    $pathReader->setGameDir($_POST['gameDir']);
    if (!empty($_POST['cache'])) {
        $pathReader->setCacheKey($_POST['cache']);
    }
    //$pathReader->mergeAllInstAndPath($pathReader->loadAllInst(), $pathReader->loadAllPath());
    //echo json_encode($pathReader->mergeAllInstAndPath($pathReader->loadAllInst(), $pathReader->loadAllPath()));
    echo json_encode($pathReader->readGta3Dat());

else :
    include_once 'view.phtml';
endif; ?>


