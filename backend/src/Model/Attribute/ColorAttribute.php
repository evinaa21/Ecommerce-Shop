<?php


namespace App\Model\Attribute;

use App\Model\Abstract\AbstractAttribute;

class ColorAttribute extends AbstractAttribute
{
    public function render(): array
    {

        return $this->toArray();
    }
}