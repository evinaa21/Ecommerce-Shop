<?php


namespace App\Model\Attribute;

use App\Model\Abstract\AbstractAttribute;

class Color extends AbstractAttribute
{
    public function render(): array
    {
        return [
            'id' => $this->name,
            'name' => $this->name,
            'type' => $this->type,
            'items' => $this->items
        ];
    }
}