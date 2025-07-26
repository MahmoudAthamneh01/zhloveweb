<?php

declare(strict_types=1);

namespace App\Application\Settings;

class Settings implements SettingsInterface
{
    private array $settings;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
    }

    public function get(string $key = ''): mixed
    {
        if (empty($key)) {
            return $this->settings;
        }

        if (strpos($key, '.') !== false) {
            return $this->getNestedValue($key);
        }

        return $this->settings[$key] ?? null;
    }

    private function getNestedValue(string $key): mixed
    {
        $keys = explode('.', $key);
        $value = $this->settings;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return null;
            }
            $value = $value[$k];
        }

        return $value;
    }

    public function set(string $key, mixed $value): void
    {
        if (strpos($key, '.') !== false) {
            $this->setNestedValue($key, $value);
            return;
        }

        $this->settings[$key] = $value;
    }

    private function setNestedValue(string $key, mixed $value): void
    {
        $keys = explode('.', $key);
        $current = &$this->settings;

        foreach ($keys as $k) {
            if (!isset($current[$k])) {
                $current[$k] = [];
            }
            $current = &$current[$k];
        }

        $current = $value;
    }
} 