import  { ComponentMountFactory, ComponentMount } from './component.mount-factory';


const ComponentMountMap = (componentType, data) : ComponentMount => {
   return ComponentMountFactory(componentType, data)
}

export { ComponentMountMap }